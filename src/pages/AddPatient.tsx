import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const AddPatient = () => {
  const [formData, setFormData] = useState({
    medical_record_number: '',
    name: '',
    gender: '',
    patient_group: '第一組',
    bed_number: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent, saveAndReturn = true) => {
    e.preventDefault();
    
    if (!formData.medical_record_number || !formData.name || !formData.gender || !formData.patient_group) {
      toast({
        title: "錯誤",
        description: "請填寫所有必填欄位",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([formData])
        .select()
        .single();

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
        description: "患者資料已建立",
      });

      if (saveAndReturn) {
        navigate('/patients');
      } else {
        // Reset form but keep the group
        const currentGroup = formData.patient_group;
        setFormData({
          medical_record_number: '',
          name: '',
          gender: '',
          patient_group: currentGroup,
          bed_number: ''
        });
      }
    } catch (error) {
      console.error('Error creating patient:', error);
      toast({
        title: "錯誤",
        description: "無法建立患者資料",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
              <h1 className="text-3xl font-bold text-medical-900">新增患者</h1>
              <p className="text-medical-600 mt-1">建立新的患者資料</p>
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
                <Label htmlFor="bed_number">
                  床號
                </Label>
                <Input
                  id="bed_number"
                  value={formData.bed_number}
                  onChange={(e) => handleInputChange('bed_number', e.target.value)}
                  placeholder="請輸入床號"
                />
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
                  type="button"
                  disabled={loading}
                  onClick={(e) => handleSubmit(e, false)}
                  className="flex-1"
                  variant="secondary"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      儲存中...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      新增下一位患者
                    </div>
                  )}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      儲存中...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      儲存患者
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

export default AddPatient;