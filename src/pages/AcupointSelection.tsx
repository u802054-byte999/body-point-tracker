import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const AcupointSelection = () => {
  const [selectedAcupoints, setSelectedAcupoints] = useState<string[]>([]);
  const [acupoints, setAcupoints] = useState<string[]>([]);
  const navigate = useNavigate();
  const { patientId } = useParams();

  // 載入穴位設定
  useEffect(() => {
    const savedAcupoints = localStorage.getItem('acupuncture_acupoints');
    if (savedAcupoints) {
      const parsed = JSON.parse(savedAcupoints);
      setAcupoints(parsed.names || Array.from({ length: 40 }, (_, i) => (i + 1).toString()));
    } else {
      // 預設40個穴位
      setAcupoints(Array.from({ length: 40 }, (_, i) => (i + 1).toString()));
    }
  }, []);

  const toggleAcupoint = (acupoint: string) => {
    setSelectedAcupoints(prev => 
      prev.includes(acupoint)
        ? prev.filter(a => a !== acupoint)
        : [...prev, acupoint]
    );
  };

  const handleComplete = () => {
    const acupointString = selectedAcupoints.sort((a, b) => {
      // 如果穴位名稱是數字，按數字排序；否則按字母排序
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.localeCompare(b);
    }).join(', ');
    // 使用 URL 參數傳遞選擇的穴位回治療頁面
    navigate(`/patient/${patientId}/treatment?acupoints=${encodeURIComponent(acupointString)}`);
  };

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
              <h1 className="text-3xl font-bold text-medical-900">針灸穴位選擇</h1>
              <p className="text-medical-600 mt-1">選擇本次治療的穴位</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">穴位選擇</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-6">
              {acupoints.map((acupoint, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`aspect-square w-full min-h-20 text-lg font-medium transition-colors ${
                    selectedAcupoints.includes(acupoint)
                      ? 'bg-blue-500 text-black border-blue-500 hover:bg-blue-600'
                      : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleAcupoint(acupoint)}
                >
                  {acupoint}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedAcupoints.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm">已選擇的穴位</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-medical-700">
                {selectedAcupoints.sort((a, b) => {
                  const aNum = parseInt(a);
                  const bNum = parseInt(b);
                  if (!isNaN(aNum) && !isNaN(bNum)) {
                    return aNum - bNum;
                  }
                  return a.localeCompare(b);
                }).join(', ')}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleComplete}
            className="bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground px-8 py-3"
          >
            完成
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AcupointSelection;