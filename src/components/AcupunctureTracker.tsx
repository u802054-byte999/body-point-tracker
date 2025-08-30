import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BodyDiagram } from './BodyDiagram';
import { RotateCcw, Activity } from 'lucide-react';
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
    id: 'torso',
    name: '軀幹',
    count: 0,
    position: { top: '35%', left: '50%', width: '120px', height: 'auto' },
  },
  {
    id: 'leftUpper',
    name: '左上肢',
    count: 0,
    position: { top: '30%', left: '20%', width: '120px', height: 'auto' },
  },
  {
    id: 'rightUpper',
    name: '右上肢',
    count: 0,
    position: { top: '30%', left: '80%', width: '120px', height: 'auto' },
  },
  {
    id: 'leftLower',
    name: '左下肢',
    count: 0,
    position: { top: '70%', left: '35%', width: '120px', height: 'auto' },
  },
  {
    id: 'rightLower',
    name: '右下肢',
    count: 0,
    position: { top: '70%', left: '65%', width: '120px', height: 'auto' },
  },
];

export const AcupunctureTracker: React.FC = () => {
  const [bodyParts, setBodyParts] = useState<BodyPart[]>(initialBodyParts);
  const { toast } = useToast();

  const handleIncrement = (id: string) => {
    setBodyParts((prev) =>
      prev.map((part) =>
        part.id === id ? { ...part, count: part.count + 1 } : part
      )
    );
  };

  const handleDecrement = (id: string) => {
    setBodyParts((prev) =>
      prev.map((part) =>
        part.id === id && part.count > 0
          ? { ...part, count: part.count - 1 }
          : part
      )
    );
  };

  const handleReset = (id: string) => {
    setBodyParts((prev) =>
      prev.map((part) =>
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
    setBodyParts((prev) => prev.map((part) => ({ ...part, count: 0 })));
    toast({
      title: "全部重置",
      description: "所有部位的針數已重置為0",
    });
  };

  const getTotalNeedles = () => {
    return bodyParts.reduce((total, part) => total + part.count, 0);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
              <Activity className="h-6 w-6" />
              針灸針數追蹤器
            </CardTitle>
            <p className="text-primary-foreground/80">
              點擊身體部位或使用按鈕記錄針數
            </p>
          </CardHeader>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary">{getTotalNeedles()}</div>
              <div className="text-sm text-muted-foreground">總針數</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-accent">
                {bodyParts.filter(part => part.count > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">使用部位</div>
            </CardContent>
          </Card>
        </div>

        {/* Body Diagram */}
        <Card>
          <CardContent className="p-6">
            <BodyDiagram
              bodyParts={bodyParts}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onReset={handleReset}
            />
          </CardContent>
        </Card>

        {/* Control Panel */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {bodyParts.map((part) => (
                <div
                  key={part.id}
                  className="text-center p-3 bg-muted rounded-lg space-y-2"
                >
                  <div className="text-sm font-medium text-foreground">
                    {part.name}
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {part.count}
                  </div>
                  <div className="flex justify-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDecrement(part.id)}
                      disabled={part.count === 0}
                      className="h-8 w-8 p-0"
                    >
                      -
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleIncrement(part.id)}
                      className="h-8 w-8 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reset Button */}
        <Card>
          <CardContent className="p-4">
            <Button
              onClick={handleResetAll}
              variant="outline"
              className="w-full h-12 text-base"
              disabled={getTotalNeedles() === 0}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              重置所有計數
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};