import React from 'react';

interface MultiplicationTableSelectorProps {
  selectedTable: number;
  onTableSelect: (table: number) => void;
  onStartProblem?: (table: number) => void;
  completedTables: number[];
}

const MultiplicationTableSelector: React.FC<MultiplicationTableSelectorProps> = ({
  selectedTable,
  onTableSelect,
  onStartProblem,
  completedTables
}) => {
  const tables = [2, 3, 4, 5, 6, 7, 8, 9];

  const getTableColor = (table: number) => {
    if (selectedTable === table) {
      return 'bg-blue-500 text-white border-blue-600';
    }
    if (completedTables && completedTables.includes(table)) {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    return 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200';
  };

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
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">구구단 선택</h3>
      <div className="grid grid-cols-4 gap-3">
        {tables.map((table) => (
          <button
            key={table}
            onClick={() => onTableSelect(table)}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 transform
              hover:scale-105 active:scale-95 font-bold text-center
              ${getTableColor(table)}
            `}
          >
            <div className="text-2xl mb-1">{getTableStatus(table)}</div>
            <div>{table}단</div>
          </button>
        ))}
      </div>
      
      {selectedTable && onStartProblem && (
        <div className="mt-4 text-center">
          <button
            onClick={() => onStartProblem(selectedTable)}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            🚀 {selectedTable}단 문제 풀기 시작!
          </button>
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
    </div>
  );
};

export default MultiplicationTableSelector;