const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
    plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
        purgecss({
            content: ['./*.html', './src/**/*.tsx', './src/**/*.ts'],
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
        }),
    ]

}