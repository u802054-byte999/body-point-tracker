import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, User, Calendar, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  medical_record_number: string;
  name: string;
  gender: string;
  created_at: string;
  session_count?: number;
  last_session?: string;
}

const PatientList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          acupuncture_sessions(count, session_date)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const patientsWithSessions = data?.map(patient => ({
        ...patient,
        session_count: patient.acupuncture_sessions?.length || 0,
        last_session: patient.acupuncture_sessions?.[0]?.session_date
      })) || [];

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

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.medical_record_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-400 w-4 h-4" />
            <Input
              placeholder="搜尋患者姓名或病歷號..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <Card 
              key={patient.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer border-medical-200"
              onClick={() => navigate(`/patient/${patient.id}/treatment`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-medical-600" />
                    {patient.name}
                  </CardTitle>
                  <Badge variant={patient.gender === '男' ? 'default' : 'secondary'}>
                    {patient.gender}
                  </Badge>
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
                      <span>{formatDate(patient.last_session)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
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