import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AcupointSetting {
  count: number;
  names: string[];
}

const Dashboard = () => {
  const [acupointSettings, setAcupointSettings] = useState<AcupointSetting>({
    count: 40,
    names: Array.from({ length: 40 }, (_, i) => (i + 1).toString())
  });
  
  const [editingAcupointCount, setEditingAcupointCount] = useState<number>(40);
  const [editingAcupointNames, setEditingAcupointNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadAcupointSettings();
  }, []);

  const loadAcupointSettings = async () => {
    // 暫時使用本地存儲，直到數據庫類型更新
    try {
      const stored = localStorage.getItem('acupoint_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        setAcupointSettings(settings);
        setEditingAcupointCount(settings.count);
        setEditingAcupointNames([...settings.names]);
      } else {
        setEditingAcupointNames([...acupointSettings.names]);
      }
    } catch (error) {
      console.error('載入穴位設定失敗:', error);
      setEditingAcupointNames([...acupointSettings.names]);
    } finally {
      setLoading(false);
    }
  };

  // 暫時移除數據庫相關函數，使用本地存儲


  const handleAcupointCountChange = (newCount: number) => {
    if (newCount < 1 || newCount > 200) {
      toast({
        title: "錯誤",
        description: "穴位數量必須在1-200之間",
        variant: "destructive",
      });
      return;
    }

    setEditingAcupointCount(newCount);
    
    // 調整穴位名稱陣列長度
    const newNames = [...editingAcupointNames];
    if (newCount > newNames.length) {
      // 增加穴位，使用數字補充
      for (let i = newNames.length; i < newCount; i++) {
        newNames.push((i + 1).toString());
      }
    } else {
      // 減少穴位，截斷陣列
      newNames.length = newCount;
    }
    
    setEditingAcupointNames(newNames);
  };

  const handleAcupointNameChange = (index: number, newName: string) => {
    const newNames = [...editingAcupointNames];
    newNames[index] = newName;
    setEditingAcupointNames(newNames);
  };

  const handleSaveAcupointSettings = async () => {
    // 檢查是否有空的穴位名稱
    const hasEmptyNames = editingAcupointNames.some(name => !name.trim());
    if (hasEmptyNames) {
      toast({
        title: "錯誤",
        description: "穴位名稱不能為空",
        variant: "destructive",
      });
      return;
    }

    const newSettings = {
      count: editingAcupointCount,
      names: editingAcupointNames.map(name => name.trim())
    };
    
    try {
      // 暫時保存至本地存儲
      localStorage.setItem('acupoint_settings', JSON.stringify(newSettings));
      setAcupointSettings(newSettings);
      
      toast({
        title: "成功",
        description: "穴位設定已保存至本地存儲",
      });
    } catch (error) {
      console.error('保存穴位設定失敗:', error);
      toast({
        title: "錯誤",
        description: "無法保存穴位設定",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100">
      <header className="bg-white shadow-sm border-b border-medical-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/patients')}
                className="text-medical-600 hover:text-medical-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回患者管理
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-medical-900">控制台</h1>
                <p className="text-medical-600 mt-1">管理系統設定</p>
              </div>
            </div>
            <Button
              onClick={handleSaveAcupointSettings}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              保存穴位設定
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-600"></div>
          </div>
        ) : (
          <div className="grid gap-8">
            {/* 穴位設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-medical-900">穴位設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 穴位數量設定 */}
              <div>
                <Label htmlFor="acupoint-count">穴位顯示數量</Label>
                <Input
                  id="acupoint-count"
                  type="number"
                  min="1"
                  max="200"
                  value={editingAcupointCount}
                  onChange={(e) => handleAcupointCountChange(parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
                <p className="text-sm text-medical-600 mt-1">設定針灸穴位選擇頁面的穴位顯示數量 (1-200)</p>
              </div>

              {/* 穴位名稱編輯 */}
              <div>
                <Label>穴位名稱編輯</Label>
                <div className="max-h-96 overflow-y-auto border border-medical-200 rounded-lg p-4 mt-2 space-y-2">
                  {editingAcupointNames.map((name, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-12 text-sm text-medical-600">#{index + 1}</span>
                      <Input
                        value={name}
                        onChange={(e) => handleAcupointNameChange(index, e.target.value)}
                        className="flex-1"
                        placeholder={`穴位 ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 保存穴位設定 */}
              <Button 
                onClick={handleSaveAcupointSettings}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                保存穴位設定
              </Button>
            </CardContent>
          </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;