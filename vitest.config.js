import { fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**', 'backend/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        reporters: ['html'],
        reportsDirectory: './tests-coverage',
        include: ['src/components/**', 'src/views/**'],
        exclude: ['src/components/__tests__/**',
                  'src/components/ApplyArrangement.vue', 
                  'src/components/ApplyArrangementRecurring.vue', 
                  'src/views/staff/ApprovedRequestWithdrawalView.vue',
                  'src/components/hr/HrManagerNavbar.vue',
                  'src/views/DSAllRequestsView.vue',],
        thresholds: {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70,
        },
      },
      testTimeout: 10000,
    },
  }),
);
