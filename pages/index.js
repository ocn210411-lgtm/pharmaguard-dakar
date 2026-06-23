// Phase 1 : redirige vers Yeumbeul-Malika
// Quand d'autres zones sont ajoutées, remplacer par la page d'accueil multi-communes
export async function getServerSideProps() {
  return { redirect: { destination: '/commune/yeumbeul-malika', permanent: false } }
}

export default function Home() { return null }
