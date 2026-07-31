import type { ComponentType } from "react";
import { FullPage1, FullPage2, FullPage3 } from "./full-page";
import {
	About1,
	About2,
	About3,
	Benefits1,
	Benefits2,
	Benefits3,
	Blog1,
	Blog2,
	Blog3,
	Cta1,
	Cta2,
	Cta3,
	Faq1,
	Faq2,
	Faq3,
	Features1,
	Features2,
	Features3,
	Footer1,
	Footer2,
	Footer3,
	Hero1,
	Hero2,
	Hero3,
	Pricing1,
	Pricing2,
	Pricing3,
	Process1,
	Process2,
	Process3,
	Sponsors1,
	Sponsors2,
	Sponsors3,
	Stats1,
	Stats2,
	Stats3,
	Testimonials1,
	Testimonials2,
	Testimonials3,
} from "./section-components";

export interface SectionVariation {
	id: string;
	name: string;
	component: ComponentType;
}

export interface SectionCategory {
	id: string;
	name: string;
	description: string;
	variations: SectionVariation[];
}

export const SECTION_CATEGORIES: SectionCategory[] = [
	{
		id: "full-page",
		name: "Página inteira",
		description: "Landing completa empilhando uma variação de cada seção.",
		variations: [
			{
				id: "full-page-1",
				name: "Variação 1 de cada seção",
				component: FullPage1,
			},
			{
				id: "full-page-2",
				name: "Variação 2 de cada seção",
				component: FullPage2,
			},
			{
				id: "full-page-3",
				name: "Variação 3 de cada seção",
				component: FullPage3,
			},
		],
	},
	{
		id: "hero",
		name: "Hero",
		description: "Abertura com nav, headline e prova social.",
		variations: [
			{
				id: "hero-1",
				name: "Centralizado com stats em faixa abaixo",
				component: Hero1,
			},
			{
				id: "hero-2",
				name: "Split com grid de métricas",
				component: Hero2,
			},
			{
				id: "hero-3",
				name: "Fundo primário com nav invertida",
				component: Hero3,
			},
		],
	},
	{
		id: "stats",
		name: "Stats",
		description: "Métricas de escala e confiança.",
		variations: [
			{
				id: "stats-1",
				name: "Grid quatro colunas com divisores",
				component: Stats1,
			},
			{
				id: "stats-2",
				name: "Lista horizontal empilhada",
				component: Stats2,
			},
			{
				id: "stats-3",
				name: "Centro com título e quatro números",
				component: Stats3,
			},
		],
	},
	{
		id: "about",
		name: "About",
		description: "História e proposta de valor da Acme.",
		variations: [
			{
				id: "about-1",
				name: "Split título e parágrafos",
				component: About1,
			},
			{
				id: "about-2",
				name: "Bloco centralizado long-form",
				component: About2,
			},
			{
				id: "about-3",
				name: "Citação com borda lateral",
				component: About3,
			},
		],
	},
	{
		id: "features",
		name: "Features",
		description: "Seis recursos numerados do produto.",
		variations: [
			{
				id: "features-1",
				name: "Grid 3 colunas com numeração 01–06",
				component: Features1,
			},
			{
				id: "features-2",
				name: "Lista dividida com números grandes",
				component: Features2,
			},
			{
				id: "features-3",
				name: "Destaque grande + cards secundários",
				component: Features3,
			},
		],
	},
	{
		id: "process",
		name: "Process",
		description: "Como começar em três passos.",
		variations: [
			{
				id: "process-1",
				name: "Três colunas com badges numerados",
				component: Process1,
			},
			{
				id: "process-2",
				name: "Timeline vertical com linha",
				component: Process2,
			},
			{
				id: "process-3",
				name: "Intro a esquerda, passos empilhados",
				component: Process3,
			},
		],
	},
	{
		id: "benefits",
		name: "Benefits",
		description: "Por que equipes escolhem a Acme.",
		variations: [
			{
				id: "benefits-1",
				name: "Grid 2x2 em cards",
				component: Benefits1,
			},
			{
				id: "benefits-2",
				name: "Lista com marcadores",
				component: Benefits2,
			},
			{
				id: "benefits-3",
				name: "Faixa primária com quatro pilares",
				component: Benefits3,
			},
		],
	},
	{
		id: "blog",
		name: "Journal",
		description: "Posts do blog Acme.",
		variations: [
			{
				id: "blog-1",
				name: "Três cards com imagem placeholder",
				component: Blog1,
			},
			{
				id: "blog-2",
				name: "Lista editorial compacta",
				component: Blog2,
			},
			{
				id: "blog-3",
				name: "Post featured + links secundários",
				component: Blog3,
			},
		],
	},
	{
		id: "sponsors",
		name: "Sponsors",
		description: "Parceiros e patrocinadores.",
		variations: [
			{
				id: "sponsors-1",
				name: "Cards com descrição de cada sponsor",
				component: Sponsors1,
			},
			{
				id: "sponsors-2",
				name: "Logos em linha minimalista",
				component: Sponsors2,
			},
			{
				id: "sponsors-3",
				name: "CTA para patrocínio com borda tracejada",
				component: Sponsors3,
			},
		],
	},
	{
		id: "testimonials",
		name: "Testimonials",
		description: "Depoimentos de clientes fictícios.",
		variations: [
			{
				id: "testimonials-1",
				name: "Citação única em destaque",
				component: Testimonials1,
			},
			{
				id: "testimonials-2",
				name: "Três cards com cargo e empresa",
				component: Testimonials2,
			},
			{
				id: "testimonials-3",
				name: "Lista com quote e autor alinhado",
				component: Testimonials3,
			},
		],
	},
	{
		id: "pricing",
		name: "Pricing",
		description: "Starter, Professional e Enterprise.",
		variations: [
			{
				id: "pricing-1",
				name: "Três planos com badge Most popular",
				component: Pricing1,
			},
			{
				id: "pricing-2",
				name: "Card único do plano Professional",
				component: Pricing2,
			},
			{
				id: "pricing-3",
				name: "Tabela comparativa",
				component: Pricing3,
			},
		],
	},
	{
		id: "faq",
		name: "FAQ",
		description: "Perguntas frequentes e newsletter.",
		variations: [
			{
				id: "faq-1",
				name: "Grid duas colunas",
				component: Faq1,
			},
			{
				id: "faq-2",
				name: "Accordion com details",
				component: Faq2,
			},
			{
				id: "faq-3",
				name: "FAQ + captura de email lateral",
				component: Faq3,
			},
		],
	},
	{
		id: "cta",
		name: "CTA",
		description: "Fechamento com trial ou newsletter.",
		variations: [
			{
				id: "cta-1",
				name: "Faixa primária centralizada",
				component: Cta1,
			},
			{
				id: "cta-2",
				name: "Barra com formulário de email",
				component: Cta2,
			},
			{
				id: "cta-3",
				name: "Card com duas ações",
				component: Cta3,
			},
		],
	},
	{
		id: "footer",
		name: "Footer",
		description: "Rodapé Acme com colunas de links.",
		variations: [
			{
				id: "footer-1",
				name: "Quatro colunas + legal",
				component: Footer1,
			},
			{
				id: "footer-2",
				name: "Split marca e links compactos",
				component: Footer2,
			},
			{
				id: "footer-3",
				name: "Faixa minimalista uma linha",
				component: Footer3,
			},
		],
	},
];

export function getCategoryById(id: string): SectionCategory | undefined {
	return SECTION_CATEGORIES.find((category) => category.id === id);
}

export function getVariationById(categoryId: string, variationId: string): SectionVariation | undefined {
	return getCategoryById(categoryId)?.variations.find((variation) => variation.id === variationId);
}
