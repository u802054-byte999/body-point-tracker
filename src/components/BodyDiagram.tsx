import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, RotateCcw } from 'lucide-react';

interface BodyPart {
  id: string;
  name: string;
  count: number;
  position: { top: string; left: string; width: string; height: string };
}

interface BodyDiagramProps {
  bodyParts: BodyPart[];
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onReset: (id: string) => void;
}

export const BodyDiagram: React.FC<BodyDiagramProps> = ({
  bodyParts,
  onIncrement,
  onDecrement,
  onReset,
}) => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Human body outline SVG */}
      <svg
        viewBox="0 0 200 400"
        className="w-full h-auto bg-card rounded-lg border-2 border-border"
        style={{ aspectRatio: '1/2' }}
      >
        {/* Head */}
        <ellipse
          cx="100"
          cy="40"
          rx="25"
          ry="30"
          className="fill-body-part stroke-border stroke-2 hover:fill-body-part-hover transition-colors cursor-pointer"
          onClick={() => onIncrement('head')}
        />
        
        {/* Torso */}
        <rect
          x="70"
          y="70"
          width="60"
          height="100"
          rx="10"
          className="fill-body-part stroke-border stroke-2 hover:fill-body-part-hover transition-colors cursor-pointer"
          onClick={() => onIncrement('torso')}
        />
        
        {/* Left Upper Limb */}
        <rect
          x="35"
          y="80"
          width="35"
          height="80"
          rx="15"
          className="fill-body-part stroke-border stroke-2 hover:fill-body-part-hover transition-colors cursor-pointer"
          onClick={() => onIncrement('leftUpper')}
        />
        
        {/* Right Upper Limb */}
        <rect
          x="130"
          y="80"
          width="35"
          height="80"
          rx="15"
          className="fill-body-part stroke-border stroke-2 hover:fill-body-part-hover transition-colors cursor-pointer"
          onClick={() => onIncrement('rightUpper')}
        />
        
        {/* Left Lower Limb */}
        <rect
          x="75"
          y="170"
          width="20"
          height="120"
          rx="10"
          className="fill-body-part stroke-border stroke-2 hover:fill-body-part-hover transition-colors cursor-pointer"
          onClick={() => onIncrement('leftLower')}
        />
        
        {/* Right Lower Limb */}
        <rect
          x="105"
          y="170"
          width="20"
          height="120"
          rx="10"
          className="fill-body-part stroke-border stroke-2 hover:fill-body-part-hover transition-colors cursor-pointer"
          onClick={() => onIncrement('rightLower')}
        />
        
        {/* Labels */}
        <text x="100" y="45" textAnchor="middle" className="fill-foreground text-xs font-medium">
          頭部
        </text>
        <text x="100" y="125" textAnchor="middle" className="fill-foreground text-xs font-medium">
          軀幹
        </text>
        <text x="52" y="125" textAnchor="middle" className="fill-foreground text-xs font-medium">
          左上肢
        </text>
        <text x="148" y="125" textAnchor="middle" className="fill-foreground text-xs font-medium">
          右上肢
        </text>
        <text x="85" y="235" textAnchor="middle" className="fill-foreground text-xs font-medium">
          左下肢
        </text>
        <text x="115" y="235" textAnchor="middle" className="fill-foreground text-xs font-medium">
          右下肢
        </text>
      </svg>
      
      {/* Counter cards positioned over body parts */}
      {bodyParts.map((part) => {
        const isActive = part.count > 0;
        return (
          <Card
            key={part.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 min-w-[120px] transition-all duration-200 ${
              isActive ? 'border-primary shadow-lg scale-105' : 'border-border'
            }`}
            style={{
              top: part.position.top,
              left: part.position.left,
            }}
          >
            <CardContent className="p-3">
              <div className="text-center space-y-2">
                <h3 className="text-sm font-semibold text-foreground">{part.name}</h3>
                <div className="text-2xl font-bold text-primary">{part.count}</div>
                <div className="flex items-center justify-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDecrement(part.id)}
                    disabled={part.count === 0}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onIncrement(part.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReset(part.id)}
                    disabled={part.count === 0}
                    className="h-8 w-8 p-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};