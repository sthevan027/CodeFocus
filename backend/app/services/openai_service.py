from openai import OpenAI
from app.core.config import settings
from typing import List, Dict, Any
import json


class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def analyze_data_and_suggest_charts(
        self, 
        columns: List[Dict[str, str]], 
        sample_data: List[Dict[str, Any]],
        row_count: int
    ) -> List[Dict[str, Any]]:
        """Analisa os dados e sugere visualizações apropriadas"""
        
        # Prepara o prompt
        prompt = f"""
        Analise os seguintes dados e sugira as melhores visualizações para um dashboard:
        
        Colunas disponíveis:
        {json.dumps(columns, indent=2)}
        
        Amostra dos dados (primeiras 5 linhas):
        {json.dumps(sample_data[:5], indent=2)}
        
        Total de linhas: {row_count}
        
        Por favor, sugira entre 3 a 6 gráficos que melhor representem esses dados.
        Para cada gráfico, forneça:
        1. type: tipo do gráfico (bar, line, pie, doughnut, radar, scatter)
        2. title: título descritivo em português
        3. data_field: campo principal dos dados
        4. label_field: campo para labels (se aplicável)
        5. description: breve descrição do insight que o gráfico mostra
        
        Responda APENAS em formato JSON válido, como um array de objetos.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um especialista em análise de dados e visualização. Sempre responda em JSON válido."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            # Extrai e parseia a resposta
            content = response.choices[0].message.content
            suggestions = json.loads(content)
            
            # Valida e formata as sugestões
            formatted_suggestions = []
            for suggestion in suggestions:
                if all(key in suggestion for key in ["type", "title", "data_field"]):
                    formatted_suggestions.append({
                        "type": suggestion["type"],
                        "title": suggestion["title"],
                        "data_field": suggestion["data_field"],
                        "label_field": suggestion.get("label_field"),
                        "description": suggestion.get("description", ""),
                        "options": {
                            "responsive": True,
                            "maintainAspectRatio": False
                        }
                    })
            
            return formatted_suggestions[:6]  # Máximo 6 gráficos
            
        except Exception as e:
            print(f"Erro ao analisar dados com OpenAI: {e}")
            # Retorna sugestões padrão em caso de erro
            return self._get_default_suggestions(columns)
    
    def _get_default_suggestions(self, columns: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        """Retorna sugestões padrão caso a API falhe"""
        suggestions = []
        
        # Tenta identificar colunas numéricas e categóricas
        numeric_columns = [col for col in columns if col["type"] in ["number", "integer", "float"]]
        text_columns = [col for col in columns if col["type"] in ["string", "text"]]
        
        if numeric_columns and text_columns:
            # Gráfico de barras
            suggestions.append({
                "type": "bar",
                "title": f"{numeric_columns[0]['name']} por {text_columns[0]['name']}",
                "data_field": numeric_columns[0]["name"],
                "label_field": text_columns[0]["name"],
                "description": "Comparação de valores por categoria"
            })
        
        if len(numeric_columns) >= 2:
            # Gráfico de linha
            suggestions.append({
                "type": "line",
                "title": f"Evolução de {numeric_columns[0]['name']}",
                "data_field": numeric_columns[0]["name"],
                "label_field": numeric_columns[1]["name"] if len(numeric_columns) > 1 else None,
                "description": "Tendência ao longo do tempo"
            })
        
        if text_columns:
            # Gráfico de pizza
            suggestions.append({
                "type": "pie",
                "title": f"Distribuição por {text_columns[0]['name']}",
                "data_field": text_columns[0]["name"],
                "label_field": None,
                "description": "Proporção de cada categoria"
            })
        
        return suggestions


openai_service = OpenAIService()