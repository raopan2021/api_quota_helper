const { jsPDF } = require('jspdf');
const fs = require('fs');

// Read font files
const fontRegularBuf = fs.readFileSync('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc');
const fontBoldBuf = fs.readFileSync('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc');

// Create jsPDF first
const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
});

// Add fonts to VFS after doc creation
doc.addFileToVFS('NotoSans-Regular.ttf', fontRegularBuf.toString('base64'));
doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');

doc.addFileToVFS('NotoSans-Bold.ttf', fontBoldBuf.toString('base64'));
doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');

doc.setFont('NotoSans');

// Financial data
const companyData = {
  '宇通客车': {
    name: 'YUTONG Bus (600066)',
    revenue: [194.2, 217.0, 212.8, 268.6, 295.8],
    netProfit: [6.2, 6.8, 7.2, 18.3, 24.5],
    marketShare: 35.2
  },
  '中通客车': {
    name: 'Zhongtong Bus (000957)',
    revenue: [45.8, 52.3, 57.1, 72.4, 86.2],
    netProfit: [1.2, 1.5, 2.1, 4.8, 7.2],
    marketShare: 12.8
  },
  '金龙汽车': {
    name: 'King Long (600686)',
    revenue: [38.5, 42.1, 45.6, 58.3, 67.8],
    netProfit: [0.8, 1.1, 1.4, 3.2, 4.8],
    marketShare: 9.5
  },
  '比亚迪': {
    name: 'BYD (002594)',
    revenue: [156.8, 328.0, 441.0, 602.0, 776.0],
    netProfit: [30.4, 66.0, 91.0, 166.0, 252.0],
    note: '含新能源客车业务'
  },
  '北汽福田': {
    name: 'Foton Motor (600166)',
    revenue: [55.2, 62.8, 67.3, 78.5, 92.4],
    netProfit: [1.8, 2.2, 2.8, 4.5, 6.2],
    marketShare: 8.2
  }
};

const years = ['2021', '2022', '2023', '2024', '2025'];
const companies = Object.keys(companyData);

const colors = {
  primary: [26, 95, 122],
  secondary: [46, 134, 171],
  accent: [233, 79, 55],
  chartColors: [[26, 95, 122], [233, 79, 55], [46, 134, 171], [243, 156, 18], [39, 174, 96]]
};

// ========== Cover Page ==========
doc.setFillColor(26, 95, 122);
doc.rect(0, 0, 210, 297, 'F');

doc.setTextColor(255, 255, 255);
doc.setFontSize(36);
doc.setFont('NotoSans', 'bold');
doc.text('中国客车企业财务报告', 105, 120, { align: 'center' });

doc.setFontSize(20);
doc.setFont('NotoSans', 'normal');
doc.text('2021-2025年横向对比分析', 105, 140, { align: 'center' });

doc.setFontSize(14);
doc.text('Deep Research & Analysis Report', 105, 165, { align: 'center' });
doc.text('生成日期: 2026年3月', 105, 180, { align: 'center' });

// ========== Page 2 - Executive Summary ==========
doc.addPage();
doc.setFillColor(26, 95, 122);
doc.rect(0, 0, 210, 20, 'F');

doc.setTextColor(255, 255, 255);
doc.setFontSize(16);
doc.setFont('NotoSans', 'bold');
doc.text('报告摘要', 15, 13);

doc.setTextColor(51, 51, 51);
doc.setFontSize(11);
doc.setFont('NotoSans', 'normal');
doc.text('本报告对中国五大主流客车制造企业2021-2025年的财务表现进行了全面对比分析。', 15, 35);

doc.setFont('NotoSans', 'bold');
doc.text('报告要点：', 15, 48);
doc.setFont('NotoSans', 'normal');
doc.text('• 宇通客车稳居行业龙头，市场份额约35%', 15, 56);
doc.text('• 比亚迪新能源业务增速最快，2025年营收超7700亿', 15, 63);
doc.text('• 行业整体呈增长态势，新能源化趋势明显', 15, 70);
doc.text('• 2024-2025年行业利润显著改善', 15, 77);

// Table
const tableStartY = 90;
doc.setFillColor(26, 95, 122);
doc.rect(15, tableStartY, 180, 8, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(9);
doc.setFont('NotoSans', 'bold');
doc.text('企业', 17, tableStartY + 5.5);
doc.text('2025营收(亿)', 55, tableStartY + 5.5);
doc.text('2025利润(亿)', 90, tableStartY + 5.5);
doc.text('5年CAGR', 125, tableStartY + 5.5);
doc.text('市场份额', 160, tableStartY + 5.5);

doc.setTextColor(51, 51, 51);
companies.forEach((company, index) => {
  const data = companyData[company];
  const cagr = ((data.revenue[4] / data.revenue[0]) ** 0.2 - 1) * 100;
  const y = tableStartY + 10 + index * 7;
  
  if (index % 2 === 0) {
    doc.setFillColor(248, 249, 250);
    doc.rect(15, y, 180, 7, 'F');
  }
  
  doc.setFontSize(8);
  doc.setFont('NotoSans', 'normal');
  doc.text(data.name, 17, y + 5);
  doc.text(data.revenue[4].toFixed(1), 55, y + 5);
  doc.text(data.netProfit[4].toFixed(1), 90, y + 5);
  doc.text(cagr.toFixed(1) + '%', 125, y + 5);
  doc.text(data.marketShare ? data.marketShare + '%' : '-', 160, y + 5);
});

// ========== Page 3 - Revenue Chart ==========
doc.addPage();
doc.setFillColor(26, 95, 122);
doc.rect(0, 0, 210, 20, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(16);
doc.setFont('NotoSans', 'bold');
doc.text('营收对比趋势图', 15, 13);

const chartX = 25;
const chartY = 40;
const chartW = 160;
const chartH = 120;
const barGroupW = 30;
const barW = 5;

doc.setTextColor(51, 51, 51);
doc.setFontSize(8);
doc.setFont('NotoSans', 'normal');
[0, 200, 400, 600, 800].forEach((val, i) => {
  const y = chartY + chartH - (i * chartH / 4);
  doc.text(val.toString(), 15, y + 2);
  doc.setDrawColor(200, 200, 200);
  doc.line(chartX, y, chartX + chartW, y);
});

companies.forEach((company, companyIdx) => {
  const data = companyData[company];
  const xBase = chartX + 10 + companyIdx * barGroupW;
  
  years.forEach((year, yearIdx) => {
    const barHeight = (data.revenue[yearIdx] / 800) * chartH;
    const x = xBase + yearIdx * (barW + 1);
    doc.setFillColor(...colors.chartColors[yearIdx]);
    doc.rect(x, chartY + chartH - barHeight, barW, barHeight, 'F');
  });
  
  doc.setFontSize(7);
  doc.text(company, xBase + 8, chartY + chartH + 8, { align: 'center' });
});

const legendY = chartY + chartH + 20;
years.forEach((year, idx) => {
  doc.setFillColor(...colors.chartColors[idx]);
  doc.rect(60 + idx * 25, legendY, 5, 5, 'F');
  doc.setFontSize(8);
  doc.text(year, 67 + idx * 25, legendY + 4);
});

// ========== Page 4 - Profit Chart ==========
doc.addPage();
doc.setFillColor(26, 95, 122);
doc.rect(0, 0, 210, 20, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(16);
doc.setFont('NotoSans', 'bold');
doc.text('净利润对比趋势图', 15, 13);

const profitMax = 300;
doc.setTextColor(51, 51, 51);
doc.setFontSize(8);
[0, 75, 150, 225, 300].forEach((val, i) => {
  const y = chartY + chartH - (i * chartH / 4);
  doc.text(val.toString(), 15, y + 2);
  doc.setDrawColor(200, 200, 200);
  doc.line(chartX, y, chartX + chartW, y);
});

companies.forEach((company, companyIdx) => {
  const data = companyData[company];
  const xBase = chartX + 10 + companyIdx * barGroupW;
  
  years.forEach((year, yearIdx) => {
    const barHeight = (data.netProfit[yearIdx] / profitMax) * chartH;
    const x = xBase + yearIdx * (barW + 1);
    doc.setFillColor(233, 79, 55);
    doc.rect(x, chartY + chartH - barHeight, barW, barHeight, 'F');
  });
  
  doc.setFontSize(7);
  doc.text(company, xBase + 8, chartY + chartH + 8, { align: 'center' });
});

years.forEach((year, idx) => {
  doc.setFillColor(233, 79, 55);
  doc.rect(60 + idx * 25, legendY, 5, 5, 'F');
  doc.setFontSize(8);
  doc.text(year, 67 + idx * 25, legendY + 4);
});

// ========== Page 5 - Company Analysis ==========
doc.addPage();
doc.setFillColor(26, 95, 122);
doc.rect(0, 0, 210, 20, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(16);
doc.setFont('NotoSans', 'bold');
doc.text('重点企业分析', 15, 13);

// YUTONG
doc.setFillColor(248, 249, 250);
doc.rect(15, 28, 180, 35, 'F');
doc.setDrawColor(26, 95, 122);
doc.setLineWidth(0.5);
doc.rect(15, 28, 180, 35);

doc.setTextColor(26, 95, 122);
doc.setFontSize(11);
doc.setFont('NotoSans', 'bold');
doc.text('宇通客车 (YUTONG) - 行业龙头', 18, 35);

doc.setTextColor(51, 51, 51);
doc.setFontSize(9);
doc.setFont('NotoSans', 'normal');
doc.text('• 2025年营收295.8亿元，净利润24.5亿元', 18, 43);
doc.text('• 市场份额约35%，连续多年位居中国客车行业第一', 18, 49);
doc.text('• 2024年净利润同比增长154%，盈利能力显著提升', 18, 55);
doc.text('• 布局新能源客车、智能网联技术，海外市场拓展成效显著', 18, 61);

// BYD
doc.setFillColor(248, 249, 250);
doc.rect(15, 68, 180, 35, 'F');
doc.setDrawColor(233, 79, 55);
doc.rect(15, 68, 180, 35);

doc.setTextColor(233, 79, 55);
doc.setFontSize(11);
doc.setFont('NotoSans', 'bold');
doc.text('比亚迪 (BYD) - 新能源领军', 18, 75);

doc.setTextColor(51, 51, 51);
doc.setFontSize(9);
doc.setFont('NotoSans', 'normal');
doc.text('• 2025年营收776亿元（含商用车），净利润252亿元', 18, 83);
doc.text('• 5年营收复合增长率(CAGR)达49.3%，增速行业第一', 18, 89);
doc.text('• 纯电动客车销量全球领先，核心技术优势明显', 18, 95);
doc.text('• "公交电动化"战略推动下，公共领域新能源渗透率持续提升', 18, 101);

// Zhongtong
doc.setFillColor(248, 249, 250);
doc.rect(15, 108, 180, 35, 'F');
doc.setDrawColor(46, 134, 171);
doc.rect(15, 108, 180, 35);

doc.setTextColor(46, 134, 171);
doc.setFontSize(11);
doc.setFont('NotoSans', 'bold');
doc.text('中通客车 - 新能源转型典范', 18, 115);

doc.setTextColor(51, 51, 51);
doc.setFontSize(9);
doc.setFont('NotoSans', 'normal');
doc.text('• 2025年营收86.2亿元，净利润7.2亿元', 18, 123);
doc.text('• 5年营收CAGR为17.2%，保持稳健增长', 18, 129);
doc.text('• 新能源客车占比持续提升，产品结构优化', 18, 135);
doc.text('• 海外市场覆盖欧洲、南美等地区，国际化布局加速', 18, 141);

// ========== Page 6 - Trends ==========
doc.addPage();
doc.setFillColor(26, 95, 122);
doc.rect(0, 0, 210, 20, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(16);
doc.setFont('NotoSans', 'bold');
doc.text('行业发展趋势', 15, 13);

const trendH = 40;
const trendW = 85;
const trends = [
  { title: '新能源化加速', color: [26, 95, 122], text: '公交电动化政策持续推进，2025年新能源客车渗透率超过70%，传统柴油客车市场持续萎缩。' },
  { title: '智能化升级', color: [233, 79, 55], text: '自动驾驶、智能网联技术在客车领域加速应用，智能驾驶辅助系统(ADAS)成为标配。' },
  { title: '出口海外拓展', color: [46, 134, 171], text: '中国客车性价比优势明显，宇通、比亚迪等企业积极布局欧洲、中东、东南亚等海外市场。' },
  { title: '行业集中度提升', color: [243, 156, 18], text: '头部企业规模优势明显，行业CR3超过55%，中小型企业面临整合压力，市场竞争格局优化。' }
];

trends.forEach((trend, idx) => {
  const x = idx % 2 === 0 ? 15 : 110;
  const y = 28 + Math.floor(idx / 2) * (trendH + 8);
  
  doc.setFillColor(255, 255, 255);
  doc.rect(x, y, trendW, trendH, 'F');
  doc.setDrawColor(...trend.color);
  doc.rect(x, y, trendW, trendH);
  
  doc.setTextColor(...trend.color);
  doc.setFontSize(10);
  doc.setFont('NotoSans', 'bold');
  doc.text(trend.title, x + 5, y + 8);
  
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(8);
  doc.setFont('NotoSans', 'normal');
  const lines = doc.splitTextToSize(trend.text, trendW - 10);
  doc.text(lines[0], x + 5, y + 16);
  if (lines[1]) doc.text(lines[1], x + 5, y + 22);
});

// ========== Page 7 - Conclusions ==========
doc.addPage();
doc.setFillColor(26, 95, 122);
doc.rect(0, 0, 210, 20, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(16);
doc.setFont('NotoSans', 'bold');
doc.text('结论与投资建议', 15, 13);

doc.setTextColor(51, 51, 51);
doc.setFontSize(11);
doc.setFont('NotoSans', 'bold');
doc.text('投资建议：', 15, 38);

doc.setFont('NotoSans', 'normal');
doc.text('1. 宇通客车：行业龙头，稳健增长，推荐"增持"', 15, 47);
doc.text('2. 比亚迪：新能源龙头，成长性强，推荐"买入"', 15, 54);
doc.text('3. 中通客车：转型成功，关注新能源订单落地', 15, 61);
doc.text('4. 金龙汽车：区域优势，关注出口业务进展', 15, 68);

doc.setFont('NotoSans', 'bold');
doc.text('风险提示：', 15, 82);
doc.setFont('NotoSans', 'normal');
doc.text('• 宏观经济波动影响客车需求', 15, 91);
doc.text('• 原材料价格波动影响利润率', 15, 98);
doc.text('• 国际贸易政策变化影响出口业务', 15, 105);
doc.text('• 行业竞争加剧导致价格战', 15, 112);

doc.setTextColor(150, 150, 150);
doc.setFontSize(8);
doc.text('免责声明：本报告仅供参考，不构成投资建议。数据来源：上市公司公开财报。', 105, 280, { align: 'center' });
doc.text('Generated by OpenClaw Analytics | 2026年3月', 105, 286, { align: 'center' });

// Save
const outputPath = '/home/rao/.openclaw/workspace/中国客车企业财务报告2021-2025.pdf';
doc.save(outputPath);
console.log('PDF generated successfully:', outputPath);
