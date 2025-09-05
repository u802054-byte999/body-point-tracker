import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Edit, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface GroupSetting {
  id: string;
  name: string;
}

interface AcupointSetting {
  count: number;
  names: string[];
}

const Dashboard = () => {
  const [groups, setGroups] = useState<GroupSetting[]>([
    { id: '1', name: '第一組' },
    { id: '2', name: '第二組' },
    { id: '3', name: '第三組' },
    { id: '4', name: '第四組' },
    { id: '5', name: '第五組' },
    { id: '6', name: '第六組' },
    { id: '7', name: '第七組' },
    { id: '8', name: '第八組' },
    { id: '9', name: '第九組' },
    { id: '10', name: '第十組' }
  ]);
  
  const [acupointSettings, setAcupointSettings] = useState<AcupointSetting>({
    count: 40,
    names: Array.from({ length: 40 }, (_, i) => (i + 1).toString())
  });
  
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [editingAcupointCount, setEditingAcupointCount] = useState<number>(40);
  const [editingAcupointNames, setEditingAcupointNames] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // 從 localStorage 載入設定
    const savedGroups = localStorage.getItem('acupuncture_groups');
    const savedAcupoints = localStorage.getItem('acupuncture_acupoints');
    
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    }
    
    if (savedAcupoints) {
      const parsed = JSON.parse(savedAcupoints);
      setAcupointSettings(parsed);
      setEditingAcupointCount(parsed.count);
      setEditingAcupointNames([...parsed.names]);
    } else {
      setEditingAcupointNames([...acupointSettings.names]);
    }
  }, []);

  const saveToLocalStorage = () => {
    localStorage.setItem('acupuncture_groups', JSON.stringify(groups));
    localStorage.setItem('acupuncture_acupoints', JSON.stringify(acupointSettings));
  };

  const handleEditGroup = (group: GroupSetting) => {
    setEditingGroup(group.id);
    setEditingGroupName(group.name);
  };

  const handleSaveGroupEdit = () => {
    if (!editingGroupName.trim()) {
      toast({
        title: "錯誤",
        description: "組別名稱不能為空",
        variant: "destructive",
      });
      return;
    }

    setGroups(prev => prev.map(group => 
      group.id === editingGroup 
        ? { ...group, name: editingGroupName.trim() }
        : group
    ));
    
    setEditingGroup(null);
    setEditingGroupName('');
    
    toast({
      title: "成功",
      description: "組別名稱已更新",
    });
  };

  const handleCancelGroupEdit = () => {
    setEditingGroup(null);
    setEditingGroupName('');
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim()) {
      toast({
        title: "錯誤",
        description: "組別名稱不能為空",
        variant: "destructive",
      });
      return;
    }

    const newId = (groups.length + 1).toString();
    setGroups(prev => [...prev, { id: newId, name: newGroupName.trim() }]);
    setNewGroupName('');
    
    toast({
      title: "成功",
      description: "新組別已添加",
    });
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(prev => prev.filter(group => group.id !== groupId));
    
    toast({
      title: "成功",
      description: "組別已刪除",
    });
  };

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

  const handleSaveAcupointSettings = () => {
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
    
    setAcupointSettings(newSettings);
    
    toast({
      title: "成功",
      description: "穴位設定已保存",
    });
  };

  const handleSaveAllSettings = () => {
    handleSaveAcupointSettings();
    saveToLocalStorage();
    
    toast({
      title: "成功",
      description: "所有設定已保存",
    });
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
              onClick={handleSaveAllSettings}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              保存所有設定
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* 組別管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-medical-900">組別管理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 新增組別 */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="new-group">新增組別</Label>
                  <Input
                    id="new-group"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="輸入組別名稱"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddGroup}>
                    <Plus className="w-4 h-4 mr-2" />
                    新增
                  </Button>
                </div>
              </div>

              {/* 現有組別列表 */}
              <div className="space-y-2">
                <Label>現有組別</Label>
                {groups.map((group) => (
                  <div key={group.id} className="flex items-center gap-2 p-2 border border-medical-200 rounded-lg">
                    {editingGroup === group.id ? (
                      <>
                        <Input
                          value={editingGroupName}
                          onChange={(e) => setEditingGroupName(e.target.value)}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={handleSaveGroupEdit}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelGroupEdit}>
                          取消
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-medical-700">{group.name}</span>
                        <Button size="sm" variant="ghost" onClick={() => handleEditGroup(group)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>確認刪除組別</AlertDialogTitle>
                              <AlertDialogDescription>
                                您確定要刪除組別「{group.name}」嗎？此操作無法復原。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteGroup(group.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                確認刪除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
      </main>
    </div>
  );
};

export default Dashboard;