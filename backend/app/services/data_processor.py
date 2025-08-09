import pandas as pd
from typing import Dict, List, Any, Tuple
import os
from app.core.config import settings


class DataProcessor:
    def __init__(self):
        self.upload_dir = "uploads"
        os.makedirs(self.upload_dir, exist_ok=True)
    
    async def process_file(self, file_path: str, file_type: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Processa arquivo CSV ou Excel e retorna DataFrame e metadados"""
        try:
            # Lê o arquivo baseado no tipo
            if file_type == "csv":
                df = pd.read_csv(file_path)
            elif file_type in ["xlsx", "xls"]:
                df = pd.read_excel(file_path)
            else:
                raise ValueError(f"Tipo de arquivo não suportado: {file_type}")
            
            # Analisa as colunas
            columns_info = []
            for col in df.columns:
                dtype = str(df[col].dtype)
                col_type = self._get_column_type(dtype)
                columns_info.append({
                    "name": col,
                    "type": col_type,
                    "dtype": dtype,
                    "null_count": int(df[col].isnull().sum()),
                    "unique_count": int(df[col].nunique())
                })
            
            # Prepara metadados
            metadata = {
                "columns": columns_info,
                "row_count": len(df),
                "column_count": len(df.columns),
                "file_size_mb": os.path.getsize(file_path) / (1024 * 1024),
                "memory_usage_mb": df.memory_usage(deep=True).sum() / (1024 * 1024)
            }
            
            return df, metadata
            
        except Exception as e:
            raise Exception(f"Erro ao processar arquivo: {str(e)}")
    
    def _get_column_type(self, dtype: str) -> str:
        """Converte dtype do pandas para tipo simplificado"""
        if "int" in dtype:
            return "integer"
        elif "float" in dtype:
            return "float"
        elif "bool" in dtype:
            return "boolean"
        elif "datetime" in dtype:
            return "datetime"
        elif "object" in dtype or "string" in dtype:
            return "string"
        else:
            return "unknown"
    
    def get_sample_data(self, df: pd.DataFrame, n_rows: int = 10) -> List[Dict[str, Any]]:
        """Retorna amostra dos dados como lista de dicionários"""
        sample_df = df.head(n_rows)
        return sample_df.to_dict(orient="records")
    
    def prepare_chart_data(self, df: pd.DataFrame, chart_config: Dict[str, Any]) -> Dict[str, Any]:
        """Prepara dados específicos para um tipo de gráfico"""
        chart_type = chart_config.get("type")
        data_field = chart_config.get("data_field")
        label_field = chart_config.get("label_field")
        
        if chart_type in ["bar", "line"]:
            if label_field:
                # Agrupa por label_field e soma data_field
                grouped = df.groupby(label_field)[data_field].sum().reset_index()
                labels = grouped[label_field].tolist()
                data = grouped[data_field].tolist()
            else:
                # Usa índice como labels
                labels = list(range(len(df)))
                data = df[data_field].tolist()
            
            return {
                "labels": labels,
                "datasets": [{
                    "label": data_field,
                    "data": data,
                    "backgroundColor": self._get_colors(len(data)),
                    "borderColor": self._get_colors(len(data)),
                    "borderWidth": 1
                }]
            }
        
        elif chart_type in ["pie", "doughnut"]:
            # Conta valores únicos
            value_counts = df[data_field].value_counts()
            
            return {
                "labels": value_counts.index.tolist(),
                "datasets": [{
                    "data": value_counts.values.tolist(),
                    "backgroundColor": self._get_colors(len(value_counts))
                }]
            }
        
        elif chart_type == "scatter":
            x_field = data_field
            y_field = label_field or data_field
            
            scatter_data = []
            for _, row in df.iterrows():
                scatter_data.append({
                    "x": row[x_field],
                    "y": row[y_field]
                })
            
            return {
                "datasets": [{
                    "label": f"{x_field} vs {y_field}",
                    "data": scatter_data,
                    "backgroundColor": "rgba(99, 102, 241, 0.6)"
                }]
            }
        
        else:
            # Retorna dados básicos para tipos não implementados
            return {
                "labels": df.index.tolist()[:20],
                "datasets": [{
                    "label": data_field,
                    "data": df[data_field].tolist()[:20]
                }]
            }
    
    def _get_colors(self, n: int) -> List[str]:
        """Gera lista de cores para gráficos"""
        colors = [
            "rgba(99, 102, 241, 0.8)",   # Indigo
            "rgba(59, 130, 246, 0.8)",   # Blue
            "rgba(16, 185, 129, 0.8)",   # Emerald
            "rgba(251, 146, 60, 0.8)",   # Orange
            "rgba(239, 68, 68, 0.8)",    # Red
            "rgba(147, 51, 234, 0.8)",   # Purple
            "rgba(236, 72, 153, 0.8)",   # Pink
            "rgba(34, 197, 94, 0.8)",    # Green
            "rgba(251, 191, 36, 0.8)",   # Amber
            "rgba(156, 163, 175, 0.8)"   # Gray
        ]
        
        # Repete cores se necessário
        return [colors[i % len(colors)] for i in range(n)]


data_processor = DataProcessor()