"use client";

import { useState, useEffect } from "react";
import { getBanners, getContents } from "../../../apis/Editor.api.js";

export const useContentData = () => {
  const [bannerImages, setBannerImages] = useState([]);
  const [contentSections, setContentSections] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bannerRes, contentRes] = await Promise.all([
        getBanners(),
        getContents(),
      ]);

      setBannerImages(
        (bannerRes.data || []).map((item) => ({
          id: item.id,
          name: item.label,
          size: `Banner • #${item.position}`,
          url: `${process.env.VITE_URL_MINIO}${item.imageUrl}`,
          position: item.position,
        }))
      );

      setContentSections(
        (contentRes.data || [])
          .map((item) => ({
            id: `content${item.position}`,
            title: item.title || `Nội dung ${item.position}`,
            content: item.body,
            imageUrls: Array.isArray(item.imageUrls)
              ? item.imageUrls.map(
                  (path) => `${process.env.VITE_URL_MINIO}${path}`
                )
              : item.imageUrls
              ? [`${process.env.VITE_URL_MINIO}${item.imageUrls}`]
              : [],
            badge: (() => {
              if (!item.badge) return "";
              try {
                if (
                  typeof item.badge === "string" &&
                  item.badge.trim().startsWith("{")
                ) {
                  return JSON.parse(item.badge);
                }
                return item.badge;
              } catch {
                return item.badge;
              }
            })(),
            ...item,
          }))
          .sort((a, b) => a.position - b.position)
      );

      return { success: true };
    } catch (error) {
      console.error("Error fetching data:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    bannerImages,
    setBannerImages,
    contentSections,
    setContentSections,
    loading,
    fetchData,
  };
};
