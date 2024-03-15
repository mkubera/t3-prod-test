"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "~/trpc/react";

export function CreatePost() {
  const router = useRouter();

  const [name, setName] = useState("hello");
  const [file, setFile] = useState<Blob | null>(null);

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      router.refresh();
      setName("");
      setFile(null);
    },
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (file) {
      // https://developer.mozilla.org/en-US/docs/Web/API/FileReader
      const reader = new FileReader();

      // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/loadend_event
      reader.onloadend = () => {
        // CREATE BASE64 STRING
        // https://en.wikipedia.org/wiki/Base64
        // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/result
        const file64 = reader.result;

        if (typeof file64 === "string") {
          createPost.mutate({ name, file64 });
        }
      };
      // The readAsDataURL method of the FileReader interface is used to read the contents
      // of the specified Blob or File. When the read operation is finished, the readyState
      // becomes DONE, and the loadend is triggered. At that time, the result attribute
      // contains the data as a data: URL representing the file's data as a base64 encoded string.
      // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
      reader.readAsDataURL(file);

      // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/error_event
      reader.onerror = () => {
        console.error(reader.error);
      };
    }
  };

  const onFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // https://developer.mozilla.org/en-US/docs/Web/API/FileList/item
      setFile(e.target.files.item(0));
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Title"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-full px-4 py-2 text-black"
      />

      <input type="file" onChange={onFilesChange} />

      <button
        type="submit"
        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={createPost.isLoading}
      >
        {createPost.isLoading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
