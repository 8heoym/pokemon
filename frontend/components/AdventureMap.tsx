'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '@/types';
import { 
  ADVENTURE_REGIONS, 
  STAGE_NAME_TEMPLATES, 
  REDUCED_STAGE_NAME_TEMPLATES,
  STAGE_STATUS, 
  STAGE_VISUAL_CONFIG,
  Stage,
  StageStatus
} from '@/utils/adventureMapConstants';
import { StageMigrationUtils } from '@/utils/stageMigration';
import { useReducedStages } from '@/utils/featureFlags';

interface AdventureMapProps {
  user: User;
  onStageSelect: (regionId: number, stageNumber: number) => void;
  selectedStage?: { regionId: number; stageNumber: number } | null;
}

const AdventureMap: React.FC<AdventureMapProps> = ({
  user,
  onStageSelect,
  selectedStage
}) => {
  // Feature Flag 상태
  const shouldUseReducedStages = useReducedStages();
  const [showMigrationNotice, setShowMigrationNotice] = useState(false);


  // 사용자 첫 방문시 마이그레이션 알림 표시 (한 번만)
  useEffect(() => {
    if (shouldUseReducedStages && !localStorage.getItem('migration_notice_shown')) {
      setShowMigrationNotice(true);
      localStorage.setItem('migration_notice_shown', 'true');
    }
  }, [shouldUseReducedStages]);

  // PRD [F-1.4] 스테이지 축소 적용된 진행 시스템 구현
  const stageData = useMemo(() => {
    return ADVENTURE_REGIONS.map(region => {
      const isRegionUnlocked = user.completedTables.length >= Math.floor((region.id - 2) * 0.5);
      
      // 스테이지 축소 적용 여부 결정
      const useReducedForThisRegion = shouldUseReducedStages && StageMigrationUtils.isRegionAffected(region.id);
      const actualStageCount = useReducedForThisRegion 
        ? StageMigrationUtils.getNewStageCount(region.id)
        : region.stages;
      
      
      // 템플릿 선택: 축소된 템플릿 또는 기존 템플릿
      const stageNames = useReducedForThisRegion
        ? (REDUCED_STAGE_NAME_TEMPLATES[region.id] || STAGE_NAME_TEMPLATES[region.id] || [])
        : (STAGE_NAME_TEMPLATES[region.id] || []);
      
      const stages: Stage[] = Array.from({ length: actualStageCount }, (_, index) => {
        const stageNumber = index + 1;
        const stageName = stageNames[index] || `${region.name} 스테이지 ${stageNumber}`;
        
        // 스테이지 해금 조건: 이전 스테이지 완료 또는 첫 번째 스테이지
        const isPrevStageCompleted = index === 0 || 
          (user.totalExperience >= (region.id - 2) * 100 + index * 50);
        
        // 스테이지 완료 조건: 해당 구구단 완료 여부 (PRD F-1.2: 호환성 보장)
        const isStageCompleted = user.completedTables.includes(region.id);
        
        let status: StageStatus;
        if (!isRegionUnlocked || !isPrevStageCompleted) {
          status = STAGE_STATUS.LOCKED;
        } else if (isStageCompleted) {
          status = STAGE_STATUS.COMPLETED;
        } else if (selectedStage?.regionId === region.id && selectedStage?.stageNumber === stageNumber) {
          status = STAGE_STATUS.IN_PROGRESS;
        } else {
          status = STAGE_STATUS.AVAILABLE;
        }

        return {
          id: `${region.id}-${stageNumber}`,
          regionId: region.id,
          stageNumber,
          name: stageName,
          description: `${region.description} - ${stageName}`,
          problemCount: 5, // 기본 문제 수
          requiredProblems: 4, // 완료 필요 문제 수
          isUnlocked: isRegionUnlocked && isPrevStageCompleted,
          isCompleted: isStageCompleted,
          completedProblems: isStageCompleted ? 5 : 0
        };
      });

      return {
        ...region,
        stages: actualStageCount, // 원래 stages 값을 덮어씀
        stageList: stages, // 실제 스테이지 배열은 새 필드에 저장
        isUnlocked: isRegionUnlocked,
        completedStages: stages.filter(stage => stage.isCompleted).length,
        totalBadges: user.completedTables.includes(region.id) ? 1 : 0,
        isReduced: useReducedForThisRegion, // 축소 여부 표시
        originalStageCount: useReducedForThisRegion ? region.stages : actualStageCount
      };
    });
  }, [user.completedTables, user.totalExperience, selectedStage, shouldUseReducedStages]);

  // PRD [F-1.6] 배지 획득 표시
  const totalBadges = user.completedTables.length;
  const availableRegions = stageData.filter(region => region.isUnlocked).length;

  return (
    <div className="adventure-map w-full max-w-6xl mx-auto p-4">
      {/* 스테이지 축소 알림 (첫 방문시만) */}
      {showMigrationNotice && (
        <motion.div
          className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="flex items-start space-x-3">
            <div className="text-2xl">🎮</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-800 mb-2">
                게임이 더욱 재미있어졌어요!
              </h3>
              <p className="text-blue-700 text-sm mb-3">
                각 지역의 핵심 스테이지만 선별하여 더 집중적인 학습이 가능합니다. 
                기존 진행사항은 모두 안전하게 보존됩니다!
              </p>
              <div className="flex justify-between items-center">
                <div className="text-xs text-blue-600">
                  • 평균 40-50% 시간 단축 • 핵심 학습에 집중 • 더 큰 성취감
                </div>
                <button
                  onClick={() => setShowMigrationNotice(false)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-100 transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 상단 모험 진행도 */}
      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          🗺️ {user.nickname}의 모험 지도
        </h2>
        <div className="flex justify-center items-center space-x-6 text-lg">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">🏆</span>
            <span className="font-bold text-gray-700">{totalBadges}/8 배지</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">🌍</span>
            <span className="font-bold text-gray-700">{availableRegions}/8 지역</span>
          </div>
        </div>
      </motion.div>

      {/* PRD [F-1.2] 시각적 학습 경로 - 지그재그 형태의 지도 */}
      <div className="adventure-path space-y-8">
        {stageData.map((region, regionIndex) => (
          <motion.div
            key={region.id}
            className={`region-container ${regionIndex % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} 
                       flex items-center justify-between w-full`}
            initial={{ opacity: 0, x: regionIndex % 2 === 0 ? -100 : 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: regionIndex * 0.1, duration: 0.5 }}
          >
            {/* 지역 헤더 카드 */}
            <div className={`region-header w-80 ${regionIndex % 2 === 0 ? 'mr-8' : 'ml-8'}`}>
              <motion.div
                className={`p-6 rounded-2xl shadow-lg bg-gradient-to-r ${region.bgGradient} 
                           text-white relative overflow-hidden`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative z-10">
                  <div className="flex items-center mb-3">
                    <span className="text-4xl mr-3">{region.emoji}</span>
                    <div>
                      <h3 className="text-xl font-bold">{region.name}</h3>
                      <p className="text-sm opacity-90">{region.description}</p>
                    </div>
                  </div>
                  
                  {/* 지역 진행도 */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>진행도</span>
                      <span>{region.completedStages}/{region.stageList.length} 스테이지
                        {region.isReduced && (
                          <span className="ml-1 text-xs bg-blue-200 text-blue-800 px-1 rounded">최적화</span>
                        )}
                      </span>
                    </div>
                    <div className="bg-white/20 rounded-full h-2">
                      <motion.div
                        className="bg-white rounded-full h-2"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${(region.completedStages / region.stageList.length) * 100}%` 
                        }}
                        transition={{ duration: 1, delay: regionIndex * 0.1 }}
                      />
                    </div>
                  </div>

                  {/* 배지 표시 */}
                  {region.totalBadges > 0 && (
                    <motion.div
                      className="absolute top-2 right-2"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: regionIndex * 0.1 + 0.5, type: "spring" }}
                    >
                      <div className="bg-yellow-400 text-yellow-900 rounded-full w-12 h-12 
                                    flex items-center justify-center font-bold shadow-lg">
                        🏆
                      </div>
                    </motion.div>
                  )}

                  {/* 잠금 오버레이 */}
                  {!region.isUnlocked && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🔒</div>
                        <p className="text-sm">다른 지역을 먼저 완료하세요</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* PRD [F-1.4] 스테이지 경로 - 자연스러운 길 형태 */}
            <div className="stages-path flex-1 max-w-2xl">
              <div className="flex flex-wrap justify-center gap-4 relative">
                {region.stageList.map((stage, stageIndex) => {
                  const visualConfig = STAGE_VISUAL_CONFIG[stage.isCompleted ? 
                    STAGE_STATUS.COMPLETED : 
                    stage.isUnlocked ? STAGE_STATUS.AVAILABLE : STAGE_STATUS.LOCKED
                  ];

                  return (
                    <React.Fragment key={`stage-group-${stage.id}`}>
                      {/* 스테이지들 사이의 연결 경로 */}
                      {stageIndex > 0 && (
                        <div className="flex items-center justify-center">
                          <div className={`w-8 h-1 rounded ${
                            region.stageList[stageIndex - 1].isCompleted ? 'bg-yellow-400' : 'bg-gray-300'
                          }`} />
                          <div className="text-lg mx-1">✨</div>
                          <div className={`w-8 h-1 rounded ${
                            stage.isCompleted ? 'bg-yellow-400' : 'bg-gray-300'
                          }`} />
                        </div>
                      )}

                      <motion.button
                      key={stage.id}
                      className={`stage-button relative p-4 rounded-xl border-2 transition-all duration-200
                                 ${visualConfig.bgColor} ${visualConfig.textColor} ${visualConfig.borderColor}
                                 ${visualConfig.glow ? 'shadow-lg ' + visualConfig.glowColor : ''}
                                 ${stage.isUnlocked ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed'}
                                 ${selectedStage?.regionId === region.id && 
                                   selectedStage?.stageNumber === stage.stageNumber ? 
                                   'ring-4 ring-blue-400 ring-opacity-50' : ''}`}
                      onClick={() => stage.isUnlocked && onStageSelect(region.id, stage.stageNumber)}
                      disabled={!stage.isUnlocked}
                      whileHover={stage.isUnlocked ? { scale: 1.05 } : {}}
                      whileTap={stage.isUnlocked ? { scale: 0.95 } : {}}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: regionIndex * 0.1 + stageIndex * 0.05 }}
                    >
                      {/* 스테이지 아이콘 */}
                      <div className={`text-2xl mb-2 ${stage.isCompleted ? '' : 'animate-pulse'}`}>
                        {visualConfig.icon}
                      </div>
                      
                      {/* 스테이지 정보 */}
                      <div className="text-center">
                        <div className="text-xs font-bold mb-1">
                          스테이지 {stage.stageNumber}
                        </div>
                        <div className="text-xs opacity-80 line-clamp-2">
                          {stage.name}
                        </div>
                      </div>

                      {/* 진행도 표시 */}
                      {stage.isUnlocked && (
                        <div className="absolute bottom-1 left-1 right-1">
                          <div className="bg-gray-200 rounded-full h-1">
                            <div
                              className={`rounded-full h-1 ${
                                stage.isCompleted ? 'bg-green-400' : 'bg-blue-400'
                              }`}
                              style={{ 
                                width: `${(stage.completedProblems / stage.problemCount) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* 연결선 (다음 지역으로) */}
            {regionIndex < stageData.length - 1 && (
              <motion.div
                className="connecting-line w-full flex justify-center my-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: regionIndex * 0.1 + 0.8 }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-1 h-8 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full" />
                  <div className="text-2xl my-2 animate-bounce">⬇️</div>
                  <div className="w-1 h-8 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full" />
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* 전체 완료 축하 */}
      {totalBadges === 8 && (
        <motion.div
          className="mt-12 text-center p-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 
                     text-white rounded-2xl shadow-2xl"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="text-6xl mb-4">🏆✨🏆</div>
          <h3 className="text-3xl font-bold mb-2">구구단 마스터 달성!</h3>
          <p className="text-lg opacity-90">
            모든 지역을 정복한 전설의 트레이너가 되었습니다!
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default AdventureMap;