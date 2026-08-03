import { $, component$, useSignal } from "@builder.io/qwik";

export default component$(() => {
  const isCopied = useSignal(false);

  const copyToClipboard = $(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      isCopied.value = true;
      // Réinitialiser après 2 secondes
      setTimeout(() => {
        isCopied.value = false;
      }, 2000);
    } catch (err) {
      console.error("Échec de la copie:", err);
    }
  });

  return (
    <div>
      <button
        type="button"
        onClick$={() => copyToClipboard("Texte à copier ici")}
        class={`px-4 py-2 rounded ${
          isCopied.value ? "bg-green-500" : "bg-blue-500"
        } text-white`}
      >
        {isCopied.value ? "Copié !" : "Copier le texte"}
      </button>
    </div>
  );
});
