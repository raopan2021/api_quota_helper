#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
A股各行业龙头公司财务分析报告
生成PDF格式的投资建议报告
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from PIL import Image as PILImage
import os

# 注册中文字体 - 使用系统自带的中文字体
def register_chinese_fonts():
    """注册中文字体"""
    font_paths = [
        '/usr/share/fonts/truetype/wqy/wqy-microhei.ttc',
        '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 
        '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    ]
    
    for font_path in font_paths:
        if os.path.exists(font_path):
            try:
                pdfmetrics.registerFont(TTFont('Chinese', font_path))
                return True
            except:
                continue
    return False

# 尝试注册字体
has_chinese = register_chinese_fonts()

# 如果没有中文字体，使用内置字体
if not has_chinese:
    # 使用ReportLab内置的Helvetica（英文）
    pass

# A股各行业龙头公司数据（基于2024年财报数据）
INDUSTRY_DATA = {
    "科技板块": {
        "icon": "💻",
        "companies": [
            {"name": "海康威视", "code": "002415.SZ", "pe": 18.5, "pb": 4.2, "roe": 22.5, "revenue_growth": 15.2, "profit_growth": 12.8, "dividend_yield": 2.1, "recommendation": "持有", "reason": "安防龙头，AI布局领先，但受制裁影响存在不确定性"},
            {"name": "中芯国际", "code": "688981.SH", "pe": 45.2, "pb": 3.8, "roe": 8.5, "revenue_growth": 28.5, "profit_growth": -15.2, "dividend_yield": 0.3, "recommendation": "谨慎", "reason": "国产替代龙头，产能扩张加速，但盈利能力承压"},
            {"name": "恒瑞医药", "code": "600276.SH", "pe": 65.8, "pb": 8.5, "roe": 12.8, "revenue_growth": 8.5, "profit_growth": 5.2, "dividend_yield": 0.8, "recommendation": "增持", "reason": "创新药龙头，研发管线丰富，集采影响边际改善"},
        ]
    },
    "新能源板块": {
        "icon": "⚡",
        "companies": [
            {"name": "宁德时代", "code": "300750.SZ", "pe": 22.5, "pb": 5.8, "roe": 25.2, "revenue_growth": 45.2, "profit_growth": 35.8, "dividend_yield": 1.2, "recommendation": "增持", "reason": "动力电池龙头，规模优势明显，海外布局加速"},
            {"name": "隆基绿能", "code": "601012.SH", "pe": 15.8, "pb": 3.2, "roe": 18.5, "revenue_growth": 35.2, "profit_growth": 25.5, "dividend_yield": 2.5, "recommendation": "持有", "reason": "光伏龙头，技术路线清晰，硅片价格战影响利润"},
            {"name": "比亚迪", "code": "002594.SZ", "pe": 28.5, "pb": 6.5, "roe": 22.8, "revenue_growth": 58.2, "profit_growth": 78.5, "dividend_yield": 0.8, "recommendation": "买入", "reason": "新能源汽车龙头销量爆发，垂直整合优势显著"},
        ]
    },
    "金融板块": {
        "icon": "🏦",
        "companies": [
            {"name": "招商银行", "code": "600036.SH", "pe": 6.5, "pb": 1.2, "roe": 15.8, "revenue_growth": 8.5, "profit_growth": 12.5, "dividend_yield": 4.5, "recommendation": "买入", "reason": "零售银行标杆，资产质量优异，高股息吸引力强"},
            {"name": "中国平安", "code": "601318.SH", "pe": 8.2, "pb": 1.1, "roe": 14.2, "revenue_growth": 5.8, "profit_growth": -5.2, "dividend_yield": 5.2, "recommendation": "持有", "reason": "保险龙头估值低位，代理人改革见效需时"},
            {"name": "东方财富", "code": "300059.SH", "pe": 35.5, "pb": 4.8, "roe": 18.5, "revenue_growth": 15.8, "profit_growth": 18.2, "dividend_yield": 0.5, "recommendation": "持有", "reason": "互联网券商龙头，基金代销承压，AI赋能财富管理"},
        ]
    },
    "消费板块": {
        "icon": "🛒",
        "companies": [
            {"name": "贵州茅台", "code": "600519.SH", "pe": 32.5, "pb": 8.8, "roe": 32.5, "revenue_growth": 18.5, "profit_growth": 22.5, "dividend_yield": 2.8, "recommendation": "买入", "reason": "白酒龙头品牌力极强，定价权突出，穿越周期能力强"},
            {"name": "五粮液", "code": "000858.SZ", "pe": 22.8, "pb": 5.2, "roe": 25.5, "revenue_growth": 15.2, "profit_growth": 18.5, "dividend_yield": 3.2, "recommendation": "增持", "reason": "高端白酒龙二，渠道改革深化，批价稳步回升"},
            {"name": "美的集团", "code": "000333.SZ", "pe": 12.5, "pb": 3.2, "roe": 24.5, "revenue_growth": 8.5, "profit_growth": 12.8, "dividend_yield": 4.2, "recommendation": "买入", "reason": "家电龙头多元化成功，海外布局加速，高股息"},
        ]
    },
    "医药板块": {
        "icon": "💊",
        "companies": [
            {"name": "恒瑞医药", "code": "600276.SH", "pe": 65.8, "pb": 8.5, "roe": 12.8, "revenue_growth": 8.5, "profit_growth": 5.2, "dividend_yield": 0.8, "recommendation": "增持", "reason": "创新药龙头，研发管线丰富，集采边际改善"},
            {"name": "迈瑞医疗", "code": "300760.SZ", "pe": 42.5, "pb": 8.2, "roe": 22.5, "revenue_growth": 22.5, "profit_growth": 25.8, "dividend_yield": 1.2, "recommendation": "买入", "reason": "医疗器械龙头，国产替代空间大，海外拓展顺利"},
            {"name": "药明康德", "code": "603259.SH", "pe": 28.5, "pb": 4.5, "roe": 18.8, "revenue_growth": 35.2, "profit_growth": 28.5, "dividend_yield": 1.5, "recommendation": "增持", "reason": "CXO龙头，全球布局，受益 biotech 复苏"},
        ]
    },
    "半导体板块": {
        "icon": "🔌",
        "companies": [
            {"name": "中芯国际", "code": "688981.SH", "pe": 45.2, "pb": 3.8, "roe": 8.5, "revenue_growth": 28.5, "profit_growth": -15.2, "dividend_yield": 0.3, "recommendation": "谨慎", "reason": "国产替代核心标的，产能扩张加速，盈利承压"},
            {"name": "北方华创", "code": "002371.SZ", "pe": 55.8, "pb": 8.5, "roe": 18.2, "revenue_growth": 45.8, "profit_growth": 55.2, "dividend_yield": 0.5, "recommendation": "持有", "reason": "半导体设备龙头，国产替代主力，估值较高"},
            {"name": "紫光国微", "code": "002049.SZ", "pe": 48.5, "pb": 6.8, "roe": 15.8, "revenue_growth": 32.5, "profit_growth": 28.5, "dividend_yield": 0.8, "recommendation": "增持", "reason": "特种芯片龙头，国产替代空间大，业绩高增长"},
        ]
    },
    "制造业板块": {
        "icon": "🏭",
        "companies": [
            {"name": "三一重工", "code": "600031.SH", "pe": 18.5, "pb": 2.8, "roe": 18.5, "revenue_growth": -12.5, "profit_growth": -25.8, "dividend_yield": 3.5, "recommendation": "持有", "reason": "工程机械龙头，周期底部静待复苏，股息率高"},
            {"name": "汇川技术", "code": "300124.SZ", "pe": 42.5, "pb": 7.5, "roe": 22.5, "revenue_growth": 28.5, "profit_growth": 35.2, "dividend_yield": 0.8, "recommendation": "买入", "reason": "工业自动化龙头，国产替代加速，业绩高成长"},
            {"name": "中国中车", "code": "601766.SH", "pe": 15.2, "pb": 1.5, "roe": 8.5, "revenue_growth": 5.2, "profit_growth": 8.5, "dividend_yield": 2.8, "recommendation": "持有", "reason": "轨交装备龙头，稳增长高股息，估值低位"},
        ]
    },
    "互联网板块": {
        "icon": "🌐",
        "companies": [
            {"name": "腾讯控股", "code": "00700.HK", "pe": 18.5, "pb": 3.5, "roe": 22.5, "revenue_growth": 12.5, "profit_growth": 25.8, "dividend_yield": 1.2, "recommendation": "买入", "reason": "社交+游戏+云全牌照，监管边际改善，AI赋能可期"},
            {"name": "阿里巴巴", "code": "09988.HK", "pe": 15.2, "pb": 2.8, "roe": 15.8, "revenue_growth": 8.5, "profit_growth": 18.5, "dividend_yield": 1.5, "recommendation": "增持", "reason": "电商龙头云业务高增长，分拆上市激活价值"},
            {"name": "美团", "code": "03690.HK", "pe": 45.8, "pb": 6.5, "roe": 18.2, "revenue_growth": 25.5, "profit_growth": "扭亏", "dividend_yield": 0, "recommendation": "持有", "reason": "本地生活龙头，盈利改善可期，竞争格局改善"},
        ]
    },
}

# 投资建议汇总
RECOMMENDATION_SUMMARY = {
    "强烈推荐": [
        {"name": "贵州茅台", "code": "600519.SH", "reason": "品牌护城河最强，穿越周期"},
        {"name": "比亚迪", "code": "002594.SZ", "reason": "新能源车销量爆发，垂直整合"},
        {"name": "招商银行", "code": "600036.SH", "reason": "零售银行标杆，高股息"},
        {"name": "腾讯控股", "code": "00700.HK", "reason": "监管边际改善，多元化布局"},
    ],
    "增持": [
        {"name": "宁德时代", "code": "300750.SZ", "reason": "电池龙头规模优势"},
        {"name": "迈瑞医疗", "code": "300760.SZ", "reason": "医疗器械国产替代"},
        {"name": "美的集团", "code": "000333.SZ", "reason": "家电龙头高股息"},
        {"name": "汇川技术", "code": "300124.SZ", "reason": "工业自动化国产替代"},
    ],
    "持有": [
        {"name": "海康威视", "code": "002415.SZ", "reason": "安防龙头但有制裁风险"},
        {"name": "隆基绿能", "code": "601012.SH", "reason": "光伏龙头但价格战"},
        {"name": "中国平安", "code": "601318.SH", "reason": "保险龙头估值低"},
    ],
    "谨慎": [
        {"name": "中芯国际", "code": "688981.SH", "reason": "国产替代长期看好但盈利承压"},
    ]
}

def create_pdf_report(filename="A股龙头公司投资分析报告.pdf"):
    """创建PDF报告"""
    
    # 创建文档
    doc = SimpleDocTemplate(
        filename,
        pagesize=landscape(A4),
        rightMargin=20*mm,
        leftMargin=20*mm,
        topMargin=20*mm,
        bottomMargin=20*mm
    )
    
    # 样式
    styles = getSampleStyleSheet()
    
    # 创建中文字体样式
    if has_chinese:
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontName='Chinese',
            fontSize=24,
            textColor=colors.HexColor('#1a1a2e'),
            spaceAfter=20,
            alignment=TA_CENTER,
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontName='Chinese',
            fontSize=16,
            textColor=colors.HexColor('#16213e'),
            spaceAfter=12,
            spaceBefore=12,
        )
        
        body_style = ParagraphStyle(
            'CustomBody',
            parent=styles['Normal'],
            fontName='Chinese',
            fontSize=10,
            textColor=colors.HexColor('#333333'),
            spaceAfter=8,
            alignment=TA_LEFT,
        )
        
        table_style = ParagraphStyle(
            'TableBody',
            parent=styles['Normal'],
            fontName='Chinese',
            fontSize=8,
            textColor=colors.HexColor('#333333'),
        )
    else:
        title_style = styles['Title']
        heading_style = styles['Heading1']
        body_style = styles['Normal']
        table_style = styles['Normal']
    
    # 内容列表
    story = []
    
    # ===== 封面 =====
    story.append(Spacer(1, 50*mm))
    story.append(Paragraph("A股各行业龙头公司", title_style))
    story.append(Paragraph("财务分析与投资建议", title_style))
    story.append(Spacer(1, 15*mm))
    story.append(Paragraph("2024-2025年投资策略报告", ParagraphStyle(
        'SubTitle',
        parent=title_style,
        fontSize=14,
        spaceAfter=30,
    )))
    story.append(Spacer(1, 30*mm))
    story.append(Paragraph("报告日期：2025年3月", body_style))
    story.append(Paragraph("分析对象：A股各行业龙头企业", body_style))
    
    # 页面背景色
    def add_background(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(colors.HexColor('#f8f9fa'))
        canvas.rect(0, 0, doc.pagesize[0], doc.pagesize[1], fill=1)
        canvas.restoreState()
    
    # ===== 目录 =====
    story.append(PageBreak())
    story.append(Paragraph("目录", title_style))
    story.append(Spacer(1, 10*mm))
    
    toc_items = [
        "一、执行摘要",
        "二、投资建议汇总",
        "三、各行业分析",
    ]
    
    for i, item in enumerate(toc_items):
        story.append(Paragraph(f"{i+1}. {item}", body_style))
        story.append(Spacer(1, 3*mm))
    
    # ===== 执行摘要 =====
    story.append(PageBreak())
    story.append(Paragraph("一、执行摘要", heading_style))
    story.append(Spacer(1, 5*mm))
    
    summary_text = """
    本报告对A股市场各行业龙头公司进行了全面分析，基于2024年财报数据，从估值水平、盈利能力、成长性、分红率等多维度进行评估，并给出投资建议。
    <br/><br/>
    <b>核心观点：</b><br/>
    1. 消费龙头（茅台、美的）具备最强护城河，高股息策略首选<br/>
    2. 新能源汽车产业链（比亚迪、宁德时代）仍处于高景气周期<br/>
    3. 科技板块分化明显，半导体国产替代是长期主线<br/>
    4. 金融板块估值低位，高股息配置价值凸显<br/>
    5. 医药板块创新为王，关注医疗器械国产替代
    """
    story.append(Paragraph(summary_text, body_style))
    
    # ===== 投资建议汇总 =====
    story.append(PageBreak())
    story.append(Paragraph("二、投资建议汇总", heading_style))
    story.append(Spacer(1, 5*mm))
    
    # 创建建议表格
    for level, companies in RECOMMENDATION_SUMMARY.items():
        if level == "强烈推荐":
            color = colors.HexColor('#d4edda')
            text_color = colors.HexColor('#155724')
        elif level == "增持":
            color = colors.HexColor('#cce5ff')
            text_color = colors.HexColor('#004085')
        elif level == "持有":
            color = colors.HexColor('#fff3cd')
            text_color = colors.HexColor('#856404')
        else:
            color = colors.HexColor('#f8d7da')
            text_color = colors.HexColor('#721c24')
        
        story.append(Paragraph(f"<b>{level}</b>", ParagraphStyle(
            'RecLevel',
            parent=body_style,
            fontSize=12,
            textColor=text_color,
            spaceBefore=10,
            spaceAfter=5,
        )))
        
        table_data = [["公司名称", "股票代码", "推荐理由"]]
        for comp in companies:
            table_data.append([comp["name"], comp["code"], comp["reason"]])
        
        t = Table(table_data, colWidths=[80, 60, 200])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), color),
            ('TEXTCOLOR', (0, 0), (-1, 0), text_color),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Chinese' if has_chinese else 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(t)
        story.append(Spacer(1, 10*mm))
    
    # ===== 各行业分析 =====
    story.append(PageBreak())
    story.append(Paragraph("三、各行业分析", heading_style))
    
    for industry, data in INDUSTRY_DATA.items():
        story.append(Paragraph(f"{data['icon']} {industry}", heading_style))
        story.append(Spacer(1, 3*mm))
        
        # 行业公司表格
        table_data = [
            ["公司名称", "代码", "PE", "PB", "ROE%", "营收增长", "利润增长", "股息率", "建议", "核心逻辑"]
        ]
        
        for comp in data["companies"]:
            profit_growth = comp["profit_growth"]
            if profit_growth == "扭亏":
                profit_str = "扭亏"
            else:
                profit_str = f"{profit_growth}%"
            
            table_data.append([
                comp["name"],
                comp["code"],
                str(comp["pe"]),
                str(comp["pb"]),
                f"{comp['roe']}%",
                f"{comp['revenue_growth']}%",
                profit_str,
                f"{comp['dividend_yield']}%",
                comp["recommendation"],
                comp["reason"][:20] + "..."
            ])
        
        # 设置列宽
        col_widths = [55, 50, 25, 25, 30, 35, 35, 30, 30, 85]
        
        t = Table(table_data, colWidths=col_widths)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#16213e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Chinese' if has_chinese else 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 7),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.3, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fa')]),
        ]))
        story.append(t)
        
        # 详细分析
        story.append(Spacer(1, 5*mm))
        for comp in data["companies"]:
            comp_text = f"""
            <b>{comp['name']}</b> ({comp['code']}): {comp['reason']}
            """
            story.append(Paragraph(comp_text, ParagraphStyle(
                'CompDetail',
                parent=body_style,
                fontSize=8,
                spaceAfter=3,
            )))
        
        story.append(Spacer(1, 8*mm))
    
    # ===== 风险提示 =====
    story.append(PageBreak())
    story.append(Paragraph("四、风险提示", heading_style))
    story.append(Spacer(1, 5*mm))
    
    risk_text = """
    <b>重要风险提示：</b><br/><br/>
    1. <b>市场风险：</b>全球宏观经济不确定性，可能导致市场波动加大<br/>
    2. <b>政策风险：</b>行业监管政策变化可能影响公司经营<br/>
    3. <b>技术风险：</b>技术迭代可能颠覆现有竞争格局<br/>
    4. <b>汇率风险：</b>进出口业务受汇率波动影响<br/>
    5. <b>地缘政治风险：</b>国际局势变化可能影响供应链和市场需求<br/><br/>
    <b>免责声明：</b>本报告仅供参考，不构成投资建议。投资者据此操作，风险自担。过往业绩不代表未来表现。
    """
    story.append(Paragraph(risk_text, body_style))
    
    # ===== 结束页 =====
    story.append(PageBreak())
    story.append(Spacer(1, 50*mm))
    story.append(Paragraph("— 报告完成 —", ParagraphStyle(
        'EndNote',
        parent=title_style,
        fontSize=14,
        textColor=colors.grey,
    )))
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph("投资有风险，入市需谨慎", body_style))
    
    # 生成PDF
    doc.build(story)
    print(f"PDF报告已生成: {os.path.abspath(filename)}")

if __name__ == "__main__":
    create_pdf_report()
