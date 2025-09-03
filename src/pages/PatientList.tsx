import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, User, Calendar, Search, Trash2, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { QRScanner } from '@/components/QRScanner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Patient {
  id: string;
  medical_record_number: string;
  name: string;
  gender: string;
  patient_group: string;
  created_at: string;
  session_count?: number;
  last_session?: string;
  last_session_id?: string;
  needle_removal_time?: string;
}

const groupOptions = [
  '全部', '第一組', '第二組', '第三組', '第四組', '第五組',
  '第六組', '第七組', '第八組', '第九組', '第十組'
];

const PatientList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('全部');
  const [completingNeedles, setCompletingNeedles] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      // First get all patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (patientsError) throw patientsError;

      // Then get session counts and last session for each patient
      const patientsWithSessions = await Promise.all(
        (patientsData || []).map(async (patient) => {
          const { data: sessions, error: sessionError } = await supabase
            .from('acupuncture_sessions')
            .select('id, session_date, needle_removal_time')
            .eq('patient_id', patient.id)
            .order('session_date', { ascending: false });

          if (sessionError) {
            console.error('Error fetching sessions for patient:', patient.id, sessionError);
          }

          return {
            ...patient,
            session_count: sessions?.length || 0,
            last_session: sessions?.[0]?.session_date,
            last_session_id: sessions?.[0]?.id,
            needle_removal_time: sessions?.[0]?.needle_removal_time
          };
        })
      );

      setPatients(patientsWithSessions);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "錯誤",
        description: "無法載入患者清單",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async (patientId: string, patientName: string) => {
    try {
      // First delete all sessions for this patient
      const { error: sessionError } = await supabase
        .from('acupuncture_sessions')
        .delete()
        .eq('patient_id', patientId);

      if (sessionError) throw sessionError;

      // Then delete the patient
      const { error: patientError } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (patientError) throw patientError;

      toast({
        title: "成功",
        description: `已刪除患者 ${patientName}`,
      });

      // Refresh the patient list
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        title: "錯誤",
        description: "無法刪除患者",
        variant: "destructive",
      });
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.medical_record_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === '全部' || patient.patient_group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCompleteNeedleRemoval = async (sessionId: string, patientName: string) => {
    setCompletingNeedles(sessionId);
    try {
      const { error } = await supabase
        .from('acupuncture_sessions')
        .update({ needle_removal_time: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "成功",
        description: `已記錄患者 ${patientName} 的拔針時間`,
      });

      // Refresh patients to show updated data
      fetchPatients();
    } catch (error) {
      console.error('Error updating needle removal time:', error);
      toast({
        title: "錯誤",
        description: "無法記錄拔針時間",
        variant: "destructive",
      });
    } finally {
      setCompletingNeedles(null);
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-medical-900">患者管理</h1>
              <p className="text-medical-600 mt-1">管理針灸治療患者資料</p>
            </div>
            <Button
              onClick={() => navigate('/patient/new')}
              className="bg-white-button text-white-button-foreground border border-gray-300 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              新增患者
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-400 w-4 h-4" />
              <Input
                placeholder="搜尋患者姓名或病歷號..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <QRScanner 
              onScanResult={(result) => setSearchTerm(result)}
              scanType="qr"
            />
          </div>
          <div className="flex-1">
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="選擇組別" />
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
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <Card 
              key={patient.id} 
              className="hover:shadow-lg transition-shadow border-medical-200 relative"
            >
              <div 
                className="cursor-pointer"
                onClick={() => navigate(`/patient/${patient.id}/treatment`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-medical-600" />
                      <Badge variant="outline" className="mr-2">{patient.patient_group}</Badge>
                      {patient.name} ({patient.gender})
                    </CardTitle>
                  </div>
                  <p className="text-sm text-medical-600">
                    病歷號: {patient.medical_record_number}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-medical-600">治療次數:</span>
                      <Badge variant="outline">{patient.session_count} 次</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-medical-600">加入日期:</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(patient.created_at)}
                      </span>
                    </div>
                    {patient.last_session && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-medical-600">最後治療:</span>
                        <span>{formatDateTime(patient.last_session)}</span>
                      </div>
                    )}
                    {patient.last_session && patient.needle_removal_time && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-medical-600">拔針時間:</span>
                        <span>{formatDateTime(patient.needle_removal_time)}</span>
                      </div>
                    )}
                    {patient.last_session && !patient.needle_removal_time && patient.last_session_id && (
                      <div className="flex justify-end mt-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteNeedleRemoval(patient.last_session_id!, patient.name);
                          }}
                          disabled={completingNeedles === patient.last_session_id}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {completingNeedles === patient.last_session_id ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              處理中...
                            </div>
                          ) : (
                            '完成拔針'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/patient/${patient.id}/edit`);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>確認刪除患者</AlertDialogTitle>
                      <AlertDialogDescription>
                        您確定要刪除患者「{patient.name}」嗎？此操作將同時刪除所有相關的治療記錄，且無法復原。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deletePatient(patient.id, patient.name)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        確認刪除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-medical-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-medical-900 mb-2">
              {searchTerm ? '找不到符合的患者' : '尚無患者資料'}
            </h3>
            <p className="text-medical-600 mb-6">
              {searchTerm ? '請嘗試其他搜尋條件' : '開始建立您的第一位患者'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => navigate('/patient/new')}
                className="bg-white-button text-white-button-foreground border border-gray-300 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                新增患者
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientList;