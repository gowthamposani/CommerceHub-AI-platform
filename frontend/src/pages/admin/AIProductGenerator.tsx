import { AlertTriangle, Copy, Loader2, Plus, RefreshCw, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { useAIGenerator } from "../../hooks/useAIGenerator";
import { notifyToast } from "../../lib/api";
import type { AIProductDescriptionRequest } from "../../types/ai";

type GeneratorFormValues = {
  productName: string;
  brand: string;
  category: string;
  features: string;
  specifications: Array<{ name: string; value: string }>;
};

const defaultValues: GeneratorFormValues = {
  productName: "",
  brand: "",
  category: "",
  features: "",
  specifications: [
    { name: "Material", value: "" },
    { name: "Warranty", value: "" }
  ]
};

function toPayload(values: GeneratorFormValues): AIProductDescriptionRequest {
  return {
    productName: values.productName.trim(),
    brand: values.brand.trim(),
    category: values.category.trim(),
    features: values.features
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean),
    specifications: values.specifications.reduce<Record<string, string>>((specifications, item) => {
      const name = item.name.trim();
      const value = item.value.trim();
      if (name && value) {
        specifications[name] = value;
      }
      return specifications;
    }, {})
  };
}

export default function AIProductGenerator() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { data, loading, error, generate, clear, refetch, canRetry } = useAIGenerator();
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<GeneratorFormValues>({ defaultValues });
  const { fields, append, remove } = useFieldArray({ control, name: "specifications" });
  const watchedDescription = watch("features");
  const featureCharacterCount = watchedDescription.length;

  const outputText = useMemo(() => {
    if (!data) {
      return "";
    }

    return [
      data.title,
      data.seoTitle,
      data.metaDescription,
      data.generatedDescription,
      data.generatedKeywords.join(", "),
      data.highlights.join("\n")
    ].join("\n\n");
  }, [data]);

  async function onSubmit(values: GeneratorFormValues) {
    try {
      await generate(toPayload(values));
    } catch {
      // Error state and toast are handled by the AI generator hook.
    }
  }

  function handleReset() {
    reset(defaultValues);
    clear();
    setCopiedField(null);
  }

  async function handleCopy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedField(label);
    notifyToast({
      title: "Copied",
      message: "Generated content copied to clipboard.",
      variant: "success"
    });
    window.setTimeout(() => setCopiedField(null), 1400);
  }

  async function handleRetry() {
    try {
      await refetch();
    } catch {
      // Error state and toast are handled by the AI generator hook.
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">AI Tools</h2>
        <p className="mt-1 text-sm text-admin-muted dark:text-slate-400">
          Product description generator for marketplace merchandising
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          className="rounded-admin border border-admin-border bg-white p-5 shadow-admin dark:border-slate-800 dark:bg-slate-900"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-admin bg-admin-gold text-white dark:bg-white dark:text-slate-950">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Product Inputs</h2>
              <p className="mt-1 text-sm text-admin-muted dark:text-slate-400">
                Add structured product details for a complete marketplace-ready output.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Product Name</span>
              <input
                className="mt-2 h-10 w-full rounded-admin border border-admin-border bg-white px-3 text-sm outline-none transition focus:border-admin-gold focus:ring-2 focus:ring-admin-gold/20 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
                {...register("productName", {
                  required: "Product name is required.",
                  minLength: { value: 2, message: "Use at least 2 characters." },
                  maxLength: { value: 150, message: "Use 150 characters or fewer." }
                })}
              />
              {errors.productName ? <p className="mt-1 text-sm text-rose-600">{errors.productName.message}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium">Brand</span>
              <input
                className="mt-2 h-10 w-full rounded-admin border border-admin-border bg-white px-3 text-sm outline-none transition focus:border-admin-gold focus:ring-2 focus:ring-admin-gold/20 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
                {...register("brand", { required: "Brand is required." })}
              />
              {errors.brand ? <p className="mt-1 text-sm text-rose-600">{errors.brand.message}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium">Category</span>
              <input
                className="mt-2 h-10 w-full rounded-admin border border-admin-border bg-white px-3 text-sm outline-none transition focus:border-admin-gold focus:ring-2 focus:ring-admin-gold/20 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
                {...register("category", { required: "Category is required." })}
              />
              {errors.category ? <p className="mt-1 text-sm text-rose-600">{errors.category.message}</p> : null}
            </label>

            <label className="block sm:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Features</span>
                <span className="text-xs text-admin-muted dark:text-slate-400">{featureCharacterCount}/1200</span>
              </div>
              <textarea
                className="mt-2 min-h-32 w-full rounded-admin border border-admin-border bg-white px-3 py-2 text-sm outline-none transition focus:border-admin-gold focus:ring-2 focus:ring-admin-gold/20 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
                placeholder="Add one feature per line"
                {...register("features", {
                  required: "At least one feature is required.",
                  maxLength: { value: 1200, message: "Use 1200 characters or fewer." },
                  validate: (value) =>
                    value
                      .split("\n")
                      .map((feature) => feature.trim())
                      .filter(Boolean).length > 0 || "At least one feature is required."
                })}
              />
              {errors.features ? <p className="mt-1 text-sm text-rose-600">{errors.features.message}</p> : null}
            </label>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Specifications</h3>
              <button
                className="inline-flex h-9 items-center gap-2 rounded-admin border border-admin-border px-3 text-sm font-medium hover:bg-admin-background dark:border-slate-800 dark:hover:bg-slate-800"
                type="button"
                onClick={() => append({ name: "", value: "" })}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <input
                    className="h-10 rounded-admin border border-admin-border bg-white px-3 text-sm outline-none transition focus:border-admin-gold focus:ring-2 focus:ring-admin-gold/20 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
                    placeholder="Name"
                    {...register(`specifications.${index}.name` as const)}
                  />
                  <input
                    className="h-10 rounded-admin border border-admin-border bg-white px-3 text-sm outline-none transition focus:border-admin-gold focus:ring-2 focus:ring-admin-gold/20 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-slate-800"
                    placeholder="Value"
                    {...register(`specifications.${index}.value` as const)}
                  />
                  <button
                    className="inline-flex h-10 w-10 items-center justify-center rounded-admin border border-admin-border text-admin-muted hover:bg-admin-background dark:border-slate-800 dark:hover:bg-slate-800"
                    type="button"
                    aria-label="Remove specification"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error ? <AIErrorPanel message={error} canRetry={canRetry} loading={loading} onRetry={handleRetry} /> : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-admin bg-admin-gold px-4 text-sm font-medium text-white transition hover:bg-[#B67B24] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              )}
              {loading ? "Generating" : "Generate"}
            </button>
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-admin border border-admin-border px-4 text-sm font-medium hover:bg-admin-background dark:border-slate-800 dark:hover:bg-slate-800"
              type="button"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
          </div>
        </form>

        <section className="rounded-admin border border-admin-border bg-white p-5 shadow-admin dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Generated Output</h2>
              <p className="mt-1 text-sm text-admin-muted dark:text-slate-400">
                Professional description, SEO metadata, keywords, and highlights.
              </p>
            </div>
            <button
              className="inline-flex h-9 items-center gap-2 rounded-admin border border-admin-border px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800"
              type="button"
              disabled={!data}
              onClick={() => handleCopy("all", outputText)}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              {copiedField === "all" ? "Copied" : "Copy"}
            </button>
          </div>

          {loading ? (
            <div className="mt-8 flex min-h-80 flex-col items-center justify-center rounded-admin border border-dashed border-slate-300 dark:border-slate-700">
              <Loader2 className="h-8 w-8 animate-spin text-admin-muted" aria-hidden="true" />
              <p className="mt-4 text-sm font-medium">Generating with Gemini</p>
              <p className="mt-1 text-sm text-admin-muted dark:text-slate-400">Building structured product content.</p>
            </div>
          ) : data ? (
            <div className="mt-6 space-y-6">
              <OutputBlock
                title="Title"
                value={data.title}
                copied={copiedField === "title"}
                onCopy={() => handleCopy("title", data.title)}
              />
              <OutputBlock
                title="Professional Description"
                value={data.generatedDescription}
                copied={copiedField === "description"}
                onCopy={() => handleCopy("description", data.generatedDescription)}
              />
              <OutputBlock
                title="SEO Title"
                value={data.seoTitle}
                copied={copiedField === "seo"}
                onCopy={() => handleCopy("seo", data.seoTitle)}
              />
              <OutputBlock
                title="SEO Description"
                value={data.metaDescription}
                copied={copiedField === "meta"}
                onCopy={() => handleCopy("meta", data.metaDescription)}
              />

              <div>
                <h3 className="text-sm font-semibold text-admin-ink dark:text-slate-200">Keywords</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.generatedKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-admin-cream px-3 py-1 text-xs font-medium text-admin-ink dark:bg-slate-800 dark:text-slate-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-admin-ink dark:text-slate-200">Highlights</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {data.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="rounded-admin border border-admin-border px-3 py-2 text-sm dark:border-slate-800"
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="mt-8 flex min-h-80 flex-col items-center justify-center rounded-admin border border-dashed border-slate-300 text-center dark:border-slate-700">
              <Sparkles className="h-8 w-8 text-slate-400" aria-hidden="true" />
              <p className="mt-4 text-sm font-medium">No content generated yet</p>
              <p className="mt-1 max-w-sm text-sm text-admin-muted dark:text-slate-400">
                Complete the product details and generate content to preview Gemini output.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

type AIErrorPanelProps = {
  message: string;
  canRetry: boolean;
  loading: boolean;
  onRetry: () => void;
};

function AIErrorPanel({ message, canRetry, loading, onRetry }: AIErrorPanelProps) {
  return (
    <div
      className="mt-5 rounded-admin border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-admin-soft dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Unable to generate product content</p>
          <p className="mt-1 leading-6">{message}</p>
          {canRetry ? (
            <button
              className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-admin border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900 dark:bg-rose-950 dark:hover:bg-rose-900"
              type="button"
              disabled={loading}
              onClick={onRetry}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              )}
              Retry
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type OutputBlockProps = {
  title: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
};

function OutputBlock({ title, value, copied, onCopy }: OutputBlockProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-admin-ink dark:text-slate-200">{title}</h3>
        <button
          className="inline-flex h-8 items-center gap-2 rounded-admin border border-admin-border px-2.5 text-xs font-medium hover:bg-admin-background dark:border-slate-800 dark:hover:bg-slate-800"
          type="button"
          onClick={onCopy}
        >
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-2 rounded-admin bg-admin-background p-4 text-sm leading-6 text-admin-ink dark:bg-slate-950 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}
