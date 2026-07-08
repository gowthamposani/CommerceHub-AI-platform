import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { generateMockProductDescription, type AIProductDescription } from "../../services/ai.service";

type GeneratorFormValues = {
  productName: string;
  brand: string;
  category: string;
  features: string;
};

export function AIGeneratorForm() {
  const [result, setResult] = useState<AIProductDescription | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GeneratorFormValues>({
    defaultValues: {
      productName: "Wireless Noise Cancelling Headphones",
      brand: "SoundMax",
      category: "Electronics",
      features: "Bluetooth 5.3, 40-hour battery life, Active noise cancellation",
    },
  });

  async function onSubmit(values: GeneratorFormValues) {
    const response = await generateMockProductDescription({
      productName: values.productName,
      brand: values.brand,
      category: values.category,
      features: values.features.split(",").map((feature) => feature.trim()),
    });
    setResult(response);
    setToast("Success toast placeholder: AI description generated.");
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <form
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Product Description Generator</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Mock AI workflow for seller content acceleration.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {[
            { label: "Product name", name: "productName" as const },
            { label: "Brand", name: "brand" as const },
            { label: "Category", name: "category" as const },
          ].map((field) => (
            <label key={field.name} className="block">
              <span className="text-sm font-medium">{field.label}</span>
              <input
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
                {...register(field.name, { required: `${field.label} is required` })}
              />
              {errors[field.name] ? (
                <p className="mt-1 text-sm text-rose-600">{errors[field.name]?.message}</p>
              ) : null}
            </label>
          ))}

          <label className="block">
            <span className="text-sm font-medium">Features</span>
            <textarea
              className="mt-2 min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
              {...register("features", { required: "At least one feature is required" })}
            />
            {errors.features ? (
              <p className="mt-1 text-sm text-rose-600">{errors.features.message}</p>
            ) : null}
          </label>
        </div>

        <button
          className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          type="submit"
          disabled={isSubmitting}
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? "Generating" : "Generate Description"}
        </button>
      </form>

      <div className="space-y-4">
        {toast ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            {toast}
          </div>
        ) : null}

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-semibold">Generated Output</h2>
          {result ? (
            <div className="mt-5 space-y-5">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Description
                </p>
                <p className="mt-2 text-sm leading-6">{result.generatedDescription}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  SEO Title
                </p>
                <p className="mt-2 font-medium">{result.seoTitle}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Meta Description
                </p>
                <p className="mt-2 text-sm">{result.metaDescription}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.generatedKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
              Generated mock content will appear here after submission.
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
