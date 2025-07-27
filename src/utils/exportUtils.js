// Função para exportar histórico em JSON
export function exportHistoryToJSON(history) {
  const dataStr = JSON.stringify(history, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'history.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Função para gerar relatório diário em texto
export function generateDailyReport(history) {
  const today = new Date().toISOString().slice(0, 10);
  const todayCycles = history.filter(c => c.completedAt && c.completedAt.startsWith(today));
  let totalMinutes = 0;
  let report = `Relatório Diário - ${today}\n\n`;
  if (todayCycles.length === 0) {
    report += 'Nenhum ciclo concluído hoje.';
  } else {
    todayCycles.forEach((c, i) => {
      report += `#${i+1} - ${c.name || 'Sem nome'} | ${c.duration} min | ${c.phase} | ${new Date(c.completedAt).toLocaleTimeString()}\n`;
      totalMinutes += c.duration;
    });
    report += `\nTotal focado: ${totalMinutes} minutos`;
  }
  return report;
}

// Função para exportar relatório diário em .txt
export function exportDailyReportTxt(history) {
  const report = generateDailyReport(history);
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio_diario_${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
} 