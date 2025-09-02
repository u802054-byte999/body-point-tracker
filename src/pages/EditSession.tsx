import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Plus, Minus, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BodyPart {
  id: string;
  name: string;
  count: number;
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

const EditSession = () => {
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([
    { id: 'head', name: '頭部', count: 0 },
    { id: 'trunk', name: '軀幹', count: 0 },
    { id: 'left-arm', name: '左上肢', count: 0 },
    { id: 'right-arm', name: '右上肢', count: 0 },
    { id: 'left-leg', name: '左下肢', count: 0 },
    { id: 'right-leg', name: '右下肢', count: 0 },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { patientId, sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from('acupuncture_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      setBodyParts([
        { id: 'head', name: '頭部', count: data.head_count },
        { id: 'trunk', name: '軀幹', count: data.trunk_count },
        { id: 'left-arm', name: '左上肢', count: data.left_arm_count },
        { id: 'right-arm', name: '右上肢', count: data.right_arm_count },
        { id: 'left-leg', name: '左下肢', count: data.left_leg_count },
        { id: 'right-leg', name: '右下肢', count: data.right_leg_count },
      ]);
    } catch (error) {
      console.error('Error fetching session:', error);
      toast({
        title: "錯誤",
        description: "無法載入治療記錄",
        variant: "destructive",
      });
      navigate(`/patient/${patientId}/treatment`);
    } finally {
      setLoading(false);
    }
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

  const getTotalNeedles = () => {
    return bodyParts.reduce((total, part) => total + part.count, 0);
  };

  const handleSaveSession = async () => {
    setSaving(true);
    try {
      const sessionData = {
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
        .update(sessionData)
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "成功",
        description: "治療記錄已更新",
      });

      navigate(`/patient/${patientId}/treatment`);
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: "錯誤",
        description: "無法更新治療記錄",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100">
      <header className="bg-white shadow-sm border-b border-medical-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/patient/${patientId}/treatment`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回治療頁面
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-medical-900">修改治療記錄</h1>
              <p className="text-medical-600 mt-1">調整針數記錄</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <Card className="bg-white shadow-lg border-medical-200">
          <CardHeader>
            <CardTitle className="text-medical-900 text-center">控制面板</CardTitle>
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
                variant="outline"
                onClick={() => navigate(`/patient/${patientId}/treatment`)}
                className="text-medical-600 border-medical-300 hover:bg-medical-50"
              >
                取消
              </Button>
              <Button
                onClick={handleSaveSession}
                disabled={saving}
                className="bg-white-button text-white-button-foreground border border-gray-300 hover:bg-gray-50"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    更新中...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    儲存修改
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditSession;