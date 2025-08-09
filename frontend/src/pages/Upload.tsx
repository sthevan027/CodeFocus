import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { FiUploadCloud, FiFile, FiCheckCircle, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface UploadedFile {
  id: number
  filename: string
  original_filename: string
  file_size: number
  status: string
}

interface DataAnalysis {
  columns: Array<{ name: string; type: string }>
  row_count: number
  suggested_charts: Array<{
    type: string
    title: string
    data_field: string
    label_field?: string
    description?: string
  }>
}

export function Upload() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [analysis, setAnalysis] = useState<DataAnalysis | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setUploadedFile(null)
      setAnalysis(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      setUploadedFile(response.data)
      toast.success('Arquivo enviado com sucesso!')
      
      // Automatically start analysis
      handleAnalyze(response.data.id)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao enviar arquivo')
    } finally {
      setUploading(false)
    }
  }

  const handleAnalyze = async (uploadId: number) => {
    setAnalyzing(true)
    
    try {
      const response = await api.get(`/upload/${uploadId}/analyze`)
      setAnalysis(response.data)
      toast.success('Análise concluída!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao analisar dados')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleCreateDashboard = async () => {
    if (!analysis || !uploadedFile) return

    try {
      const response = await api.post('/dashboards', {
        title: `Dashboard - ${uploadedFile.original_filename}`,
        description: `Dashboard automático criado a partir de ${uploadedFile.original_filename}`,
        charts_config: analysis.suggested_charts,
        data_source: uploadedFile.filename,
      })
      
      toast.success('Dashboard criado com sucesso!')
      navigate(`/dashboard/${response.data.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao criar dashboard')
    }
  }

  const removeFile = () => {
    setFile(null)
    setUploadedFile(null)
    setAnalysis(null)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Upload de Dados</h1>
        <p className="text-gray-400">
          Faça upload de seus dados para criar dashboards automáticos
        </p>
      </div>

      {/* Upload Area */}
      {!file && !uploadedFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="glass">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <input {...getInputProps()} />
              <FiUploadCloud className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                {isDragActive
                  ? 'Solte o arquivo aqui'
                  : 'Arraste um arquivo ou clique para selecionar'}
              </h3>
              <p className="text-sm text-gray-400">
                Suportamos arquivos CSV e Excel (máx. 10MB)
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* File Selected */}
      {file && !uploadedFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="glass">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-500/20 rounded-lg">
                  <FiFile className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{file.name}</h3>
                  <p className="text-sm text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <Button
              onClick={handleUpload}
              isLoading={uploading}
              className="w-full"
            >
              Enviar Arquivo
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Upload Complete & Analysis */}
      {uploadedFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Upload Status */}
          <Card variant="glass">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <FiCheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">Upload concluído!</h3>
                <p className="text-sm text-gray-400">
                  {uploadedFile.original_filename}
                </p>
              </div>
            </div>
          </Card>

          {/* Analysis Results */}
          {analyzing && (
            <Card variant="glass" className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Analisando dados com IA...</p>
            </Card>
          )}

          {analysis && (
            <>
              {/* Data Summary */}
              <Card variant="glass">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Resumo dos Dados
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-400">Total de Linhas</p>
                    <p className="text-2xl font-bold text-white">
                      {analysis.row_count.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total de Colunas</p>
                    <p className="text-2xl font-bold text-white">
                      {analysis.columns.length}
                    </p>
                  </div>
                </div>
                
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  Colunas Detectadas:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.columns.map((col) => (
                    <span
                      key={col.name}
                      className="px-3 py-1 text-sm rounded-full glass-dark"
                    >
                      {col.name} ({col.type})
                    </span>
                  ))}
                </div>
              </Card>

              {/* Suggested Charts */}
              <Card variant="glass">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Visualizações Sugeridas
                </h3>
                <div className="space-y-4">
                  {analysis.suggested_charts.map((chart, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-white">{chart.title}</h4>
                          {chart.description && (
                            <p className="text-sm text-gray-400 mt-1">
                              {chart.description}
                            </p>
                          )}
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-primary-500/20 text-primary-400">
                          {chart.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={handleCreateDashboard}
                  className="w-full mt-6"
                  size="lg"
                >
                  Criar Dashboard
                </Button>
              </Card>
            </>
          )}
        </motion.div>
      )}
    </div>
  )
}