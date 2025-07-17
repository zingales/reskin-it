import { defaultConfig, defineConfig, mergeConfigs, createSystem } from '@chakra-ui/react';

const theme = defineConfig({
  theme: {
    recipes: {
      Button: {
        variants: {
          variant: {
            custom: {
              borderRadius: 'full',
              bg: 'blue',
              color: 'white',
              textTransform: 'uppercase',
            },
          },
        },
      },
    },
  },
});

// Extends default theme
const config = mergeConfigs(defaultConfig, theme);
const system = createSystem(config);

export default system; 