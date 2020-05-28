const Separator = () => <span className="mx-4">&middot;</span>

const Footer: React.FC = () => (
  <footer className="mt-4 text-gray-600 text-sm text-center">
    <a href="https://nextjs.org/">Built with Next.js</a>
    <Separator />
    <a href="https://netlify.com">Hosted on Netlify</a>
    <Separator />
    <a href="https://github.com/statico/jsgrids">Source available on GitHub</a>
    <Separator />
    <a href="http://www.heropatterns.com">
      Header background from Hero Patterns
    </a>
  </footer>
)

export default Footer
