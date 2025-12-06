import React, { useState } from "react";
import { Button } from "semantic-ui-react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function LoadMoreButton({ endpoint, onLoad }) {
  const [loading, setLoading] = useState(false);

  const handleLoadMore = async () => {
    if (!endpoint) return;
    setLoading(true);

    try {
      const res = await api.get(endpoint);

      onLoad({
        items: res.data.data,
        nextPage: res.data.next_page_url,
      });

    } catch (err) {
      console.error("Load more failed:", err);
      toast.error("Error load more")
    } finally {
      setLoading(false);
    }
  };

  return (
    endpoint && (
        <div className="text-center mt-3">
            <Button content="Load More" color="white" loading={loading} onClick={handleLoadMore} />
        </div>
    )
  );
}
