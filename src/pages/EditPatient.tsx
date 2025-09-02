import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QRScanner } from '@/components/QRScanner';

const groupOptions = [
  '第一組', '第二組', '第三組', '第四組', '第五組',
  '第六組', '第七組', '第八組', '第九組', '第十組'
];

const EditPatient = () => {
  const [formData, setFormData] = useState({
    medical_record_number: '',
    name: '',
    gender: '',
    patient_group: '第一組'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      
      setFormData({
        medical_record_number: data.medical_record_number,
        name: data.name,
        gender: data.gender,
        patient_group: data.patient_group || '第一組'
      });
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast({
        title: "錯誤",
        description: "無法載入患者資料",
        variant: "destructive",
      });
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.medical_record_number || !formData.name || !formData.gender) {
      toast({
        title: "錯誤",
        description: "請填寫所有必填欄位",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('patients')
        .update(formData)
        .eq('id', patientId);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "錯誤",
            description: "病歷號已存在，請使用其他病歷號",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "成功",
        description: "患者資料已更新",
      });

      navigate('/patients');
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        title: "錯誤",
        description: "無法更新患者資料",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600 mx-auto mb-4"></div>
          <p className="text-medical-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100">
      <header className="bg-white shadow-sm border-b border-medical-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/patients')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-medical-900">編輯患者</h1>
              <p className="text-medical-600 mt-1">修改患者資料</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-medical-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-medical-600" />
              患者基本資料
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="medical_record_number">
                  病歷號 <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="medical_record_number"
                    value={formData.medical_record_number}
                    onChange={(e) => handleInputChange('medical_record_number', e.target.value)}
                    placeholder="請輸入病歷號"
                    required
                    className="flex-1"
                  />
                  <QRScanner 
                    onScanResult={(result) => handleInputChange('medical_record_number', result)}
                    scanType="qr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  姓名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="請輸入患者姓名"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">
                  性別 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇性別" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="男">男</SelectItem>
                    <SelectItem value="女">女</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient_group">
                  組別 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.patient_group}
                  onValueChange={(value) => handleInputChange('patient_group', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇組別" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupOptions.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/patients')}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-white-button text-white-button-foreground border border-gray-300 hover:bg-gray-50"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      更新中...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      更新患者
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditPatient;