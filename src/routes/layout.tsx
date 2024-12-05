import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";

import Header from "../components/layouts/header";
import Footer from "../components/layouts/footer";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // En iyi performansı elde etmek ve barındırma maliyetlerini azaltmak için bu isteğin önbelleğe alınmasını kontrol edin:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Her zaman varsayılan olarak önbelleğe alınmış bir yanıt sunar; bir haftaya kadar.
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Maksimum her 5 saniyede bir, bu sayfanın yeni bir sürümünü almak için sunucuda yeniden doğrulama yapın.
    maxAge: 5,
  });
};

export default component$(() => {
  return (
    <>
      <Header />
      <main class="bg-white">
        <Slot />
      </main>
      <Footer />
    </>
  );
});
