import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import rehypeExternalLinks from 'rehype-external-links'
import rehypePresetMinify from 'rehype-preset-minify'

const rehypeExternalLinksConfig = [
    rehypeExternalLinks,
    { target: '_blank', rel: ['noopener', 'noreferrer'] }
]

export default defineConfig({
	site: 'https://revisto.github.io/putting-the-you-in-cpu/',
	base: '/putting-the-you-in-cpu/',
	trailingSlash: 'never',
	output: 'static',
	server: {
		port: parseInt(process.env.PORT || '3000')
	},
	integrations: [
		mdx({
			rehypePlugins: [ rehypeExternalLinksConfig, rehypePresetMinify ]
		}),
		sitemap({
			filter: page => page !== 'https://cpu.land/404'
		})
	],
	markdown: {
		smartypants: true,
		rehypePlugins: [ rehypeExternalLinksConfig ],
		shikiConfig: {
			theme: 'one-dark-pro'
		}
	}
})
