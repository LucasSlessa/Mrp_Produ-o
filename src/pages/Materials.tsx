import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Search, AlertCircle, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  listarMateriais, 
  criarMaterial, 
  atualizarMaterial, 
  excluirMaterial as deletarMaterial,
  atualizarEstoque,
  Material 
} from '../services/materiais';

type FormData = {
  nome: string;
  codigo_interno: string;
  descricao: string;
  unidade: string;
  estoque_atual: number;
  estoque_minimo: number;
  estoque_maximo: number;
  lead_time: number;
  custo: number;
};

const Materials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>();

  // Buscar materiais
  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const materiais = await listarMateriais();
      setMaterials(materiais);
    } catch (err: any) {
      console.error('Erro ao buscar materiais:', err);
      setError('Não foi possível carregar os materiais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Função para abrir o modal no modo de criação
  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setCurrentMaterial(null);
    reset({
      nome: '',
      codigo_interno: '',
      descricao: '',
      unidade: 'UN',
      estoque_atual: 0,
      estoque_minimo: 0,
      estoque_maximo: 0,
      lead_time: 0,
      custo: 0
    });
    setIsModalOpen(true);
  };

  // Função para abrir o modal no modo de edição
  const handleOpenEditModal = (material: Material) => {
    setIsEditMode(true);
    setCurrentMaterial(material);
    setValue('nome', material.nome);
    setValue('codigo_interno', material.codigo_interno);
    setValue('descricao', material.descricao || '');
    setValue('unidade', material.unidade);
    setValue('estoque_atual', material.estoque_atual || 0);
    setValue('estoque_minimo', material.estoque_minimo || 0);
    setValue('estoque_maximo', material.estoque_maximo || 0);
    setValue('lead_time', material.lead_time || 0);
    setValue('custo', material.custo || 0);
    setIsModalOpen(true);
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Função para criar/atualizar material
  const onSubmit = async (data: FormData) => {
    try {
      if (isEditMode && currentMaterial) {
        // Atualizar material existente
        await atualizarMaterial(currentMaterial.id, {
          nome: data.nome,
          codigo_interno: data.codigo_interno,
          descricao: data.descricao || '',
          unidade: data.unidade,
          estoque_atual: data.estoque_atual || 0,
          estoque_minimo: data.estoque_minimo || 0,
          estoque_maximo: data.estoque_maximo || 0,
          lead_time: data.lead_time || 0,
          custo: data.custo || 0
        });
        
        toast.success('Material atualizado com sucesso!');
      } else {
        // Criar novo material
        await criarMaterial({
          nome: data.nome,
          codigo_interno: data.codigo_interno,
          descricao: data.descricao || '',
          unidade: data.unidade,
          estoque_atual: data.estoque_atual || 0,
          estoque_minimo: data.estoque_minimo || 0,
          estoque_maximo: data.estoque_maximo || 0,
          lead_time: data.lead_time || 0,
          custo: data.custo || 0
        });
        
        toast.success('Material cadastrado com sucesso!');
      }
      
      // Fechar modal e atualizar lista
      handleCloseModal();
      fetchMaterials();
    } catch (err: any) {
      console.error('Erro ao salvar material:', err);
      toast.error(err.message || 'Erro ao salvar material');
    }
  };

  // Função para excluir material
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este material?')) return;
    
    try {
      await deletarMaterial(id);
      toast.success('Material excluído com sucesso!');
      fetchMaterials();
    } catch (err: any) {
      console.error('Erro ao excluir material:', err);
      toast.error(err.message || 'Erro ao excluir material');
    }
  };

  // Função para atualizar estoque
  const handleUpdateStock = async (id: string, quantidade: number) => {
    try {
      await atualizarEstoque(id, quantidade);
      toast.success('Estoque atualizado com sucesso!');
      fetchMaterials();
    } catch (err: any) {
      console.error('Erro ao atualizar estoque:', err);
      toast.error(err.message || 'Erro ao atualizar estoque');
    }
  };

  // Filtrar materiais com base no termo de pesquisa
  const filteredMaterials = materials.filter(material => 
    material.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.codigo_interno.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Materiais</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gerencie os materiais disponíveis para produção
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra de ações */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar materiais..."
            className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Material
        </button>
      </div>

      {/* Lista de materiais */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
          </div>
        ) : filteredMaterials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidade
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque Atual
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque Mínimo
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{material.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{material.codigo_interno}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{material.unidade}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{material.estoque_atual}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{material.estoque_minimo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(material)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum material encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece cadastrando um novo material.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Material */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {isEditMode ? 'Editar Material' : 'Novo Material'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                        Nome
                      </label>
                      <input
                        type="text"
                        {...register('nome', { required: 'Nome é obrigatório' })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.nome && (
                        <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="codigo_interno" className="block text-sm font-medium text-gray-700">
                        Código Interno
                      </label>
                      <input
                        type="text"
                        {...register('codigo_interno', { required: 'Código interno é obrigatório' })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.codigo_interno && (
                        <p className="mt-1 text-sm text-red-600">{errors.codigo_interno.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
                        Descrição
                      </label>
                      <textarea
                        {...register('descricao')}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="unidade" className="block text-sm font-medium text-gray-700">
                        Unidade
                      </label>
                      <select
                        {...register('unidade', { required: 'Unidade é obrigatória' })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="UN">Unidade (UN)</option>
                        <option value="KG">Quilograma (KG)</option>
                        <option value="M">Metro (M)</option>
                        <option value="L">Litro (L)</option>
                        <option value="CX">Caixa (CX)</option>
                      </select>
                      {errors.unidade && (
                        <p className="mt-1 text-sm text-red-600">{errors.unidade.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="estoque_atual" className="block text-sm font-medium text-gray-700">
                          Estoque Atual
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...register('estoque_atual', { valueAsNumber: true })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="estoque_minimo" className="block text-sm font-medium text-gray-700">
                          Estoque Mínimo
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...register('estoque_minimo', { valueAsNumber: true })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="estoque_maximo" className="block text-sm font-medium text-gray-700">
                          Estoque Máximo
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...register('estoque_maximo', { valueAsNumber: true })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="lead_time" className="block text-sm font-medium text-gray-700">
                          Lead Time (dias)
                        </label>
                        <input
                          type="number"
                          {...register('lead_time', { valueAsNumber: true })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="custo" className="block text-sm font-medium text-gray-700">
                          Custo
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...register('custo', { valueAsNumber: true })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isEditMode ? 'Atualizar' : 'Cadastrar'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;