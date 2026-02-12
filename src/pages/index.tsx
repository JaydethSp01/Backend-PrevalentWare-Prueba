import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>PrevalentWare API</title>
      </Head>
      <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
        <h1>PrevalentWare API</h1>
        <p>Backend en ejecución.</p>
        <p>
          <a href="/api/docs">Documentación (Swagger)</a>
        </p>
      </main>
    </>
  );
}
