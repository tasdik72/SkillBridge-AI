import React, { createContext, useContext } from 'react';
import { realAIService } from '../services/ai';

interface AIContextType {
  generateRoadmap: (goal: string, level: string) => Promise<any>;
}

const AIContext = createContext<AIContextType | null>(null);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within AIProvider');
  return context;
};

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const generateRoadmap = async (goal: string, level: string) => {
    const roadmapData = await realAIService.generateRoadmap(goal, level);
    return {
      ...roadmapData,
      milestones: roadmapData.milestones.map((m: any, index: number) => ({
        id: `m${index + 1}`,
        title: m.title,
        description: m.desc,
        duration: m.duration_days,
        reward: m.reward_usd,
        deliverable: m.deliverable,
        status: index === 0 ? 'available' : 'locked'
      }))
    };
  };

  return (
    <AIContext.Provider value={{ generateRoadmap }}>
      {children}
    </AIContext.Provider>
  );
};