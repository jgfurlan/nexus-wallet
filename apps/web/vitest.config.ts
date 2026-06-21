/**
 * Configuração do Vitest para o frontend (`apps/web`).
 * Mescla a configuração padrão do Vite com opções de teste.
 *
 * @module vitest.config.ts
 */
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
  })
);
