import { useState } from 'react';
import { Calculator, ExternalLink } from 'lucide-react';

const MRPCalculation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenCalculator = () => {
    window.open('https://lucasslessa.github.io/ESTAGIO_COMPUTACAO/', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cálculo MRP</h1>
        <p className="mt-1 text-sm text-gray-500">
          Acesse a calculadora MRP para realizar seus cálculos
        </p>
      </div>

      {/* Conteúdo principal */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <Calculator className="mx-auto h-12 w-12 text-blue-600" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Calculadora MRP</h3>
            <p className="mt-1 text-sm text-gray-500">
              Clique no botão abaixo para acessar a calculadora MRP em uma nova aba
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleOpenCalculator}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Calculator className="mr-2 h-5 w-5" />
                Abrir Calculadora MRP
                <ExternalLink className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instruções */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Como utilizar a calculadora MRP
          </h3>
          <div className="mt-4 text-sm text-gray-500">
            <ol className="list-decimal list-inside space-y-2">
              <li>Clique no botão "Abrir Calculadora MRP" acima</li>
              <li>A calculadora será aberta em uma nova aba do navegador</li>
              <li>Insira os dados necessários nos campos correspondentes</li>
              <li>Siga as instruções apresentadas na calculadora</li>
              <li>Utilize os resultados para seu planejamento de materiais</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Dicas e observações */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Calculator className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Dicas importantes
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Mantenha seus dados de estoque atualizados</li>
                <li>Considere os lead times de cada material</li>
                <li>Verifique a estrutura do produto antes de calcular</li>
                <li>Salve ou anote os resultados importantes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MRPCalculation;