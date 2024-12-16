"use client";

import { useEffect, useRef } from 'react';

interface RadarChartProps {
  data: {
    category: string;
    value: number;
  }[];
  size?: number;
  modelStats?: {
    contextRetention: number;
    responseAccuracy: number;
    coherenceScore: number;
    topicAlignment: number;
  };
}

export function RadarChart({ 
  data, 
  size = 200,
  modelStats 
}: RadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Calculate center and radius
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 50;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background circles with labels
    const circles = [0.2, 0.4, 0.6, 0.8, 1];
    circles.forEach((percentage, i) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * percentage, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();

      // Add value labels (0-10)
      if (i === circles.length - 1) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px var(--font-sans)';
        ctx.textAlign = 'right';
        ctx.fillText('10', centerX - 5, centerY - (radius * percentage));
      }
    });

    // Calculate points
    const points = data.map((d, i) => {
      const angle = (i * 2 * Math.PI / data.length) - Math.PI / 2;
      const value = d.value / 100;
      return {
        x: centerX + radius * value * Math.cos(angle),
        y: centerY + radius * value * Math.sin(angle),
        label: d.category,
        labelX: centerX + (radius + 20) * Math.cos(angle),
        labelY: centerY + (radius + 20) * Math.sin(angle)
      };
    });

    // Draw axes
    points.forEach(point => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + radius * Math.cos(Math.atan2(point.y - centerY, point.x - centerX)), 
                 centerY + radius * Math.sin(Math.atan2(point.y - centerY, point.x - centerX)));
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();

      // Draw labels with better positioning
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '12px var(--font-sans)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Adjust label position based on angle
      const angle = Math.atan2(point.y - centerY, point.x - centerX);
      const labelRadius = radius + 40;
      const labelX = centerX + labelRadius * Math.cos(angle);
      const labelY = centerY + labelRadius * Math.sin(angle);
      
      ctx.fillText(point.label, labelX, labelY);
    });

    // Draw data shape with gradient
    ctx.beginPath();
    points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.2)');  // Light blue
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.2)');  // Darker blue
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.strokeStyle = 'rgb(56, 189, 248)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgb(56, 189, 248)';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

  }, [data, size, modelStats]);

  return (
    <div className="flex items-center justify-center w-full aspect-square">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
