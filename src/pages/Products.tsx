import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Search, AlertCircle, ShoppingCart, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  listarProdutos, 
  criarProduto, 
  atualizarProduto, 
  excluirProduto as deletarProduto, 
  buscarProdutoComMateriais,
  Produto 
} from '../services/produtos';
import { 
  listarMateriais, 
  Material 
} from '../services/materiais';
import { v4 as uuidv4 } from 'uuid';

type BOMItem = {
  id: string;
  produto_id: string;
  material_id: string;
  material_nome?: string;
  material_unidade?: string;
  quantidade: number;
};

type FormData = {
  nome: string;
  codigo_interno: string;
  descricao: string;
  unidade: string;
  tempo_producao: number;
};

type BOMFormData = {
  material_id: string;
  quantidade: number;
};

const Products = () => {
  const [products, setProducts] = useState<Produto[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [productBOM, setProductBOM] = useState<BOMItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bomLoading, setBomLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBOMModalOpen, setIsBOMModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Produto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>();
  const { register: registerBOM, handleSubmit: handleSubmitBOM, reset: resetBOM, formState: { errors: errorsBOM } } = useForm<BOMFormData>();

  // Buscar produtos
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const produtos = await listarProdutos();
      setProducts(produtos);
    } catch (err: any) {
      console.error('Erro ao buscar produtos:', err);
      setError('Não foi possível carregar os produtos');
    } finally {
      setLoading(false);
    }
  };

  // Buscar materiais (para o modal de BOM)
  const fetchMaterials = async () => {
    try {
      const materiais = await listarMateriais();
      setMaterials(materiais);
    } catch (err: any) {
      console.error('Erro ao buscar materiais:', err);
      toast.error('Não foi possível carregar os materiais');
    }
  };

  // Buscar BOM de um produto
  const fetchProductBOM = async (productId: string) => {
    setBomLoading(true);
    try {
      const produtoComMateriais = await buscarProdutoComMateriais(productId);
      if (produtoComMateriais && produtoComMateriais.materiais) {
        setProductBOM(produtoComMateriais.materiais);
      }
    } catch (err: any) {
      console.error('Erro ao buscar estrutura de materiais:', err);
      toast.error('Não foi possível carregar a estrutura de materiais');
    } finally {
      setBomLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMaterials();
  }, []);

  // Função para abrir o modal no modo de criação
  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setCurrentProduct(null);
    reset({
      nome: '',
      codigo_interno: '',
      descricao: '',
      unidade: '',
      tempo_producao: 1
    });
    setIsModalOpen(true);
  };

  // Função para abrir o modal no modo de edição
  const handleOpenEditModal = (product: Produto) => {
    setIsEditMode(true);
    setCurrentProduct(product);
    setValue('nome', product.nome);
    setValue('codigo_interno', product.codigo_interno);
    setValue('descricao', product.descricao || '');
    setValue('tempo_producao', product.tempo_producao);
    setIsModalOpen(true);
  };

  // Função para abrir o modal de BOM
  const handleOpenBOMModal = (product: Produto) => {
    setCurrentProduct(product);
    fetchProductBOM(product.id);
    setIsBOMModalOpen(true);
  };

  // Função para fechar os modais
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseBOMModal = () => {
    setIsBOMModalOpen(false);
    setProductBOM([]);
  };

  // Função para criar/atualizar produto
  const onSubmit = async (data: FormData) => {
    try {
      if (isEditMode && currentProduct) {
        // Atualizar produto existente
        await atualizarProduto(currentProduct.id, {
          nome: data.nome,
          codigo_interno: data.codigo_interno,
          descricao: data.descricao,
          unidade: data.unidade,
          tempo_producao: data.tempo_producao,
          preco: currentProduct.preco,
          lote_minimo: currentProduct.lote_minimo,
          lote_multiplo: currentProduct.lote_multiplo
        });
        
        toast.success('Produto atualizado com sucesso!');
      } else {
        // Criar novo produto
        await criarProduto({
          nome: data.nome,
          codigo_interno: data.codigo_interno,
          descricao: data.descricao,
          unidade: data.unidade,
          tempo_producao: data.tempo_producao,
          preco: 0,
          lote_minimo: 1,
          lote_multiplo: 1
        });
        
        toast.success('Produto cadastrado com sucesso!');
      }
      
      // Fechar modal e atualizar lista
      handleCloseModal();
      fetchProducts();
    } catch (err: any) {
      console.error('Erro ao salvar produto:', err);
      toast.error(err.message || 'Erro ao salvar produto');
    }
  };

  // Função para adicionar material ao BOM
  const onSubmitBOM = async (data: BOMFormData) => {
    if (!currentProduct) return;
    
    try {
      // Verificar se o material já existe no BOM
      const exists = productBOM.some(item => item.material_id === data.material_id);
      
      if (exists) {
        toast.error('Este material já está na estrutura do produto');
        return;
      }
      
      // Adicionar material ao BOM
      const id = uuidv4();
      const novoBOMItem = {
        id,
        produto_id: currentProduct.id,
        material_id: data.material_id,
        quantidade: data.quantidade
      };
      
      // Aqui você deve implementar a função para adicionar o material ao BOM no banco
      // await adicionarMaterialAoProduto(novoBOMItem);
      
      // Atualizar a lista de materiais do produto
      fetchProductBOM(currentProduct.id);
      resetBOM();
      
      toast.success('Material adicionado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao adicionar material:', err);
      toast.error('Erro ao adicionar material ao produto');
    }
  };

  // Função para remover material do BOM
  const handleRemoveMaterial = async (bomItemId: string) => {
    if (!currentProduct) return;
    
    try {
      // Aqui você deve implementar a função para remover o material do BOM no banco
      // await removerMaterialDoProduto(bomItemId);
      
      // Atualizar a lista de materiais do produto
      fetchProductBOM(currentProduct.id);
      toast.success('Material removido com sucesso!');
    } catch (err: any) {
      console.error('Erro ao remover material:', err);
      toast.error('Erro ao remover material do produto');
    }
  };

  // Função para deletar produto
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
      await deletarProduto(id);
      toast.success('Produto excluído com sucesso!');
      fetchProducts();
    } catch (err: any) {
      console.error('Erro ao excluir produto:', err);
      toast.error('Erro ao excluir produto');
    }
  };

  // Filtrar produtos pelo termo de busca
  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.codigo_interno.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ... Resto do JSX permanece o mesmo ...
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie seus produtos e suas estruturas de materiais
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5 inline-block mr-2" />
          Novo Produto
        </button>
      </div>

      {/* Barra de busca */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de produtos */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <li key={product.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-gray-400 mr-3" />
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {product.nome}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenBOMModal(product)}
                        className="text-gray-400 hover:text-gray-500"
                        title="Estrutura de Materiais"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="text-gray-400 hover:text-gray-500"
                        title="Editar"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-gray-400 hover:text-red-500"
                        title="Excluir"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Código: {product.codigo_interno}
                      </p>
                      {product.tempo_producao && (
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          Tempo de Produção: {product.tempo_producao} min
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece cadastrando um novo produto.
          </p>
        </div>
      )}

      {/* Modal de Produto */}
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
                    {isEditMode ? 'Editar Produto' : 'Novo Produto'}
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
                      <label htmlFor="unidade" className="block text-sm font-medium text-gray-700">
                        Unidade
                      </label>
                      <select
                        {...register('unidade', { required: 'Unidade é obrigatória' })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selecione uma unidade</option>
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

                    <div>
                      <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
                        Descrição
                      </label>
                      <textarea
                        {...register('descricao')}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="tempo_producao" className="block text-sm font-medium text-gray-700">
                        Tempo de Produção (minutos)
                      </label>
                      <input
                        type="number"
                        {...register('tempo_producao', { 
                          required: 'Tempo de produção é obrigatório',
                          min: { value: 1, message: 'Tempo deve ser maior que 0' }
                        })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.tempo_producao && (
                        <p className="mt-1 text-sm text-red-600">{errors.tempo_producao.message}</p>
                      )}
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

      {/* Modal de BOM */}
      {isBOMModalOpen && currentProduct && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Estrutura de Materiais - {currentProduct.nome}
                </h3>

                {/* Lista de materiais */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Materiais do Produto</h4>
                  {bomLoading ? (
                    <div className="animate-pulse space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-10 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  ) : productBOM.length > 0 ? (
                    <div className="space-y-2">
                      {productBOM.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div>
                            <span className="font-medium">{item.material_nome}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {item.quantidade} {item.material_unidade}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveMaterial(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum material adicionado</p>
                  )}
                </div>

                {/* Formulário para adicionar material */}
                <form onSubmit={handleSubmitBOM(onSubmitBOM)} className="space-y-4">
                  <div>
                    <label htmlFor="material_id" className="block text-sm font-medium text-gray-700">
                      Material
                    </label>
                    <select
                      {...registerBOM('material_id', { required: 'Material é obrigatório' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione um material</option>
                      {materials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.nome} ({material.unidade})
                        </option>
                      ))}
                    </select>
                    {errorsBOM.material_id && (
                      <p className="mt-1 text-sm text-red-600">{errorsBOM.material_id.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...registerBOM('quantidade', {
                        required: 'Quantidade é obrigatória',
                        min: { value: 0.01, message: 'Quantidade deve ser maior que 0' }
                      })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errorsBOM.quantidade && (
                      <p className="mt-1 text-sm text-red-600">{errorsBOM.quantidade.message}</p>
                    )}
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                    >
                      Adicionar Material
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseBOMModal}
                      className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                    >
                      Fechar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;