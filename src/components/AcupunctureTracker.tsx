import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Minus, Plus, RotateCcw, Save, ArrowLeft, User } from 'lucide-react';
import { BodyDiagram } from './BodyDiagram';
import { useToast } from '@/hooks/use-toast';

interface BodyPart {
  id: string;
  name: string;
  count: number;
  position: { top: string; left: string; width: string; height: string };
}

const initialBodyParts: BodyPart[] = [
  {
    id: 'head',
    name: '頭部',
    count: 0,
    position: { top: '15%', left: '50%', width: '120px', height: 'auto' },
  },
  {
    id: 'trunk',
    name: '軀幹',
    count: 0,
    position: { top: '35%', left: '50%', width: '120px', height: 'auto' },
  },
  {
    id: 'left-arm',
    name: '左上肢',
    count: 0,
    position: { top: '30%', left: '20%', width: '120px', height: 'auto' },
  },
  {
    id: 'right-arm',
    name: '右上肢',
    count: 0,
    position: { top: '30%', left: '80%', width: '120px', height: 'auto' },
  },
  {
    id: 'left-leg',
    name: '左下肢',
    count: 0,
    position: { top: '70%', left: '35%', width: '120px', height: 'auto' },
  },
  {
    id: 'right-leg',
    name: '右下肢',
    count: 0,
    position: { top: '70%', left: '65%', width: '120px', height: 'auto' },
  },
];

interface Patient {
  id: string;
  medical_record_number: string;
  name: string;
  gender: string;
}

interface Session {
  id: string;
  session_date: string;
  head_count: number;
  trunk_count: number;
  left_arm_count: number;
  right_arm_count: number;
  left_leg_count: number;
  right_leg_count: number;
  total_needles: number;
  needle_removal_time?: string;
}

const AcupunctureTracker = () => {
  const [bodyParts, setBodyParts] = useState<BodyPart[]>(initialBodyParts);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completingNeedles, setCompletingNeedles] = useState<string | null>(null);
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (patientId) {
      fetchPatient();
      fetchSessions();
    } else {
      setLoading(false);
    }
  }, [patientId]);

  const fetchPatient = async () => {
    if (!patientId) return;
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      setPatient(data);
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast({
        title: "錯誤",
        description: "無法載入患者資料",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    if (!patientId) return;
    
    try {
      const { data, error } = await supabase
        .from('acupuncture_sessions')
        .select('*')
        .eq('patient_id', patientId)
        .order('session_date', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
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

  const handleIncrement = (id: string) => {
    setBodyParts(prev =>
      prev.map(part =>
        part.id === id ? { ...part, count: part.count + 1 } : part
      )
    );
  };

  const handleDecrement = (id: string) => {
    setBodyParts(prev =>
      prev.map(part =>
        part.id === id && part.count > 0
          ? { ...part, count: part.count - 1 }
          : part
      )
    );
  };

  const handleReset = (id: string) => {
    setBodyParts(prev =>
      prev.map(part =>
        part.id === id ? { ...part, count: 0 } : part
      )
    );
    
    const partName = bodyParts.find(part => part.id === id)?.name;
    toast({
      title: "已重置",
      description: `${partName}的針數已重置為0`,
    });
  };

  const handleResetAll = () => {
    setBodyParts(prev => prev.map(part => ({ ...part, count: 0 })));
    toast({
      title: "全部重置",
      description: "所有部位的針數已重置為0",
    });
  };

  const getTotalNeedles = () => {
    return bodyParts.reduce((total, part) => total + part.count, 0);
  };

  const handleCompleteNeedleRemoval = async (sessionId: string) => {
    setCompletingNeedles(sessionId);
    try {
      const { error } = await supabase
        .from('acupuncture_sessions')
        .update({ needle_removal_time: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "成功",
        description: "拔針時間已記錄",
      });

      // Refresh sessions to show updated data
      fetchSessions();
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

  const handleSaveSession = async () => {
    if (!patient) return;
    
    setSaving(true);
    try {
      const sessionData = {
        patient_id: patient.id,
        head_count: bodyParts.find(p => p.id === 'head')?.count || 0,
        trunk_count: bodyParts.find(p => p.id === 'trunk')?.count || 0,
        left_arm_count: bodyParts.find(p => p.id === 'left-arm')?.count || 0,
        right_arm_count: bodyParts.find(p => p.id === 'right-arm')?.count || 0,
        left_leg_count: bodyParts.find(p => p.id === 'left-leg')?.count || 0,
        right_leg_count: bodyParts.find(p => p.id === 'right-leg')?.count || 0,
        total_needles: getTotalNeedles(),
      };

      const { error } = await supabase
        .from('acupuncture_sessions')
        .insert([sessionData]);

      if (error) throw error;

      toast({
        title: "成功",
        description: "針灸記錄已儲存",
      });

      // Reset counts after saving and refresh sessions
      setBodyParts(initialBodyParts);
      fetchSessions();
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "錯誤",
        description: "無法儲存針灸記錄",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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

  // If no patient ID in URL, show simple interface without patient info
  if (!patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 p-4">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-medical-900 mb-2">針灸計數器</h1>
            <p className="text-medical-600">點擊身體部位或使用控制面板來計算針數</p>
            <div className="mt-4">
              <Button onClick={() => navigate('/')} className="bg-medical-600 hover:bg-medical-700">
                前往患者管理
              </Button>
            </div>
          </header>

          <div className="text-center mb-8">
            <Card className="inline-block">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-medical-600 mb-1">總針數</p>
                    <Badge variant="default" className="text-lg px-4 py-2">
                      {getTotalNeedles()}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-medical-600 mb-1">使用部位</p>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {bodyParts.filter(part => part.count > 0).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-white shadow-lg border-medical-200">
              <CardHeader>
                <CardTitle className="text-medical-900">身體圖示</CardTitle>
              </CardHeader>
              <CardContent>
                <BodyDiagram
                  bodyParts={bodyParts}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  onReset={handleReset}
                />
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg border-medical-200">
              <CardHeader>
                <CardTitle className="text-medical-900">控制面板</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bodyParts.map((part) => (
                    <div
                      key={part.id}
                      className="flex items-center justify-between p-4 bg-medical-50 rounded-lg border border-medical-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-medical-900">{part.name}</span>
                        <Badge variant="outline" className="text-medical-700">
                          {part.count}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDecrement(part.id)}
                          disabled={part.count === 0}
                          className="text-medical-600 border-medical-300 hover:bg-medical-100"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleIncrement(part.id)}
                          className="bg-medical-600 hover:bg-medical-700"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReset(part.id)}
                          disabled={part.count === 0}
                          className="text-medical-600 border-medical-300 hover:bg-medical-100"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-4 mt-6">
                  <Button
                    onClick={handleResetAll}
                    variant="outline"
                    className="text-medical-600 border-medical-300 hover:bg-medical-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    重置全部
                  </Button>
                  <Button
                    onClick={() => {
                      toast({
                        title: "提示",
                        description: "請選擇患者後再儲存針數記錄",
                        variant: "destructive",
                      });
                    }}
                    disabled={getTotalNeedles() === 0}
                    className="bg-white-button text-white-button-foreground border border-gray-300 hover:bg-gray-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    儲存針數記錄
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-medical-600">找不到患者資料</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100">
      <header className="bg-white shadow-sm border-b border-medical-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                返回患者列表
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-medical-900">針灸治療</h1>
                <p className="text-medical-600 mt-1">點擊身體部位或使用控制面板來計算針數</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Info Card */}
        <Card className="mb-8 border-medical-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-medical-600" />
              患者資訊
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-medical-600">病歷號</Label>
                <p className="font-medium">{patient.medical_record_number}</p>
              </div>
              <div>
                <Label className="text-sm text-medical-600">姓名</Label>
                <p className="font-medium">{patient.name}</p>
              </div>
              <div>
                <Label className="text-sm text-medical-600">性別</Label>
                <Badge variant={patient.gender === '男' ? 'default' : 'secondary'}>
                  {patient.gender}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mb-8">
          <Card className="inline-block">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-sm text-medical-600 mb-1">總針數</p>
                  <Badge variant="default" className="text-lg px-4 py-2">
                    {getTotalNeedles()}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-medical-600 mb-1">使用部位</p>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {bodyParts.filter(part => part.count > 0).length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mb-8">
          <Card className="bg-white shadow-lg border-medical-200 w-full max-w-4xl">
            <CardHeader>
              <CardTitle className="text-medical-900 text-center">身體圖示</CardTitle>
            </CardHeader>
            <CardContent>
              <BodyDiagram
                bodyParts={bodyParts}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onReset={handleReset}
              />
              <div className="flex justify-center gap-4 mt-6">
                <Button
                  onClick={handleResetAll}
                  variant="outline"
                  className="text-medical-600 border-medical-300 hover:bg-medical-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  重置全部
                </Button>
                <Button
                  onClick={handleSaveSession}
                  disabled={saving || getTotalNeedles() === 0}
                  className="bg-white-button text-white-button-foreground border border-gray-300 hover:bg-gray-50"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      儲存中...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      儲存針數記錄
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions History */}
        {sessions.length > 0 && (
          <Card className="bg-white shadow-lg border-medical-200 mt-8">
            <CardHeader>
              <CardTitle className="text-medical-900">治療記錄</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 bg-medical-50 rounded-lg border border-medical-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-medical-900">
                        治療時間: {formatDateTime(session.session_date)}
                      </span>
                      <Badge variant="default" className="text-medical-700">
                        總針數: {session.total_needles}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-medical-600 mb-3">
                      <div>頭部: {session.head_count}</div>
                      <div>軀幹: {session.trunk_count}</div>
                      <div>左上肢: {session.left_arm_count}</div>
                      <div>右上肢: {session.right_arm_count}</div>
                      <div>左下肢: {session.left_leg_count}</div>
                      <div>右下肢: {session.right_leg_count}</div>
                    </div>
                    {session.needle_removal_time && (
                      <div className="text-sm text-medical-600 mb-3">
                        拔針時間: {formatDateTime(session.needle_removal_time)}
                      </div>
                    )}
                    <div className="flex justify-end">
                      {!session.needle_removal_time ? (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteNeedleRemoval(session.id)}
                          disabled={completingNeedles === session.id}
                          className="bg-white-button text-white-button-foreground border border-gray-300 hover:bg-gray-50"
                        >
                          {completingNeedles === session.id ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                              處理中...
                            </div>
                          ) : (
                            '完成拔針'
                          )}
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="text-green-700">
                          已完成拔針
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export { AcupunctureTracker };