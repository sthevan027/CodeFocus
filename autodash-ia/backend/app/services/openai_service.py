from __future__ import annotations

from typing import Any, Dict, List
from openai import OpenAI
import json

from ..config import get_settings


def build_prompt(schema_summary: Dict[str, Any]) -> str:
    columns = schema_summary.get("columns", [])
    num_rows = schema_summary.get("num_rows", 0)
    prompt = (
        "Você é um assistente de BI. Receberá o resumo de uma tabela (colunas, tipos e exemplos) "
        "e deve sugerir de 2 a 4 gráficos úteis em formato STRICTO JSON para Chart.js (react-chartjs-2).\n\n"
        f"Linhas: {num_rows}\n"
        f"Colunas: {columns}\n\n"
        "Responda com um objeto JSON com o formato: {\n"
        "  \"title\": string,\n"
        "  \"charts\": [\n"
        "    { \"type\": 'bar'|'line'|'pie'|'doughnut'|'radar'|'scatter', \n"
        "      \"data\": { \"labels\": string[], \"datasets\": [{ \"label\": string, \"data\": number[], \"backgroundColor\": string|string[], \"borderColor\": string|string[] }] },\n"
        "      \"options\": { \"responsive\": true }\n"
        "    }, ...\n"
        "  ]\n"
        "}\n\n"
        "Garanta que os arrays tenham comprimentos compatíveis, sem comentários, apenas JSON válido."
    )
    return prompt


def generate_chart_config(schema_summary: Dict[str, Any]) -> Dict[str, Any]:
    settings = get_settings()
    client = OpenAI(api_key=settings.openai_api_key)

    prompt = build_prompt(schema_summary)

    completion = client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": "Você gera apenas JSON válido."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )

    content = completion.choices[0].message.content
    try:
        data = json.loads(content) if content else {}
    except Exception:
        data = {"title": "Dashboard", "charts": []}
    if "title" not in data:
        data["title"] = "Dashboard"
    if "charts" not in data:
        data["charts"] = []
    return data