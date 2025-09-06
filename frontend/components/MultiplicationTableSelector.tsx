import React from 'react';
import { PokemonCard } from './ui/PokemonCard';
import { PokemonButton } from './ui/PokemonButton';

interface User {
  id: string;
  nickname: string;
  trainerLevel: number;
  currentRegion: string;
  totalExperience: number;
  caughtPokemon: number[];
  completedTables: number[];
}

interface MultiplicationTableSelectorProps {
  user: User;
  selectedTable: number;
  onTableSelect: (table: number) => void;
  onStartProblem?: (table: number) => void;
}

const MultiplicationTableSelector: React.FC<MultiplicationTableSelectorProps> = ({
  user,
  selectedTable,
  onTableSelect,
  onStartProblem
}) => {
  const completedTables = user.completedTables;
  const tables = [2, 3, 4, 5, 6, 7, 8, 9];

  const getTableStatus = (table: number) => {
    if (completedTables && completedTables.includes(table)) {
      return '✅';
    }
    if (selectedTable === table) {
      return '🎯';
    }
    return '📚';
  };

  return (
    <PokemonCard>
      <h3 className="text-xl font-bold text-gray-800 mb-4">구구단 선택</h3>
      <div className="grid grid-cols-4 gap-3">
        {tables.map((table) => (
          <PokemonButton
            key={table}
            onClick={() => onTableSelect(table)}
            variant={selectedTable === table ? 'primary' : 
                    (completedTables && completedTables.includes(table) ? 'success' : 'outline')}
            size="md"
            className="h-20 flex-col"
          >
            <div className="text-2xl mb-1">{getTableStatus(table)}</div>
            <div>{table}단</div>
          </PokemonButton>
        ))}
      </div>
      
      {selectedTable && onStartProblem && (
        <div className="mt-4 text-center">
          <PokemonButton
            onClick={() => onStartProblem(selectedTable)}
            variant="success"
            size="lg"
          >
            🚀 {selectedTable}단 문제 풀기 시작!
          </PokemonButton>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>완료한 구구단:</span>
            <span className="font-bold">{completedTables?.length || 0}/8</span>
          </div>
          <div className="mt-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${((completedTables?.length || 0) / 8) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </PokemonCard>
  );
};

export default MultiplicationTableSelector;