"use client";

import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getContents } from "../../apis/Editor.api";
import { Card, Badge, Button, Divider, Typography, Space, Spin } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ShareAltOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

function NewsDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [news, setNews] = useState(location.state?.news || null);
  const [loading, setLoading] = useState(!news);

  useEffect(() => {
    if (!news) {
      setLoading(true);
      getContents().then((res) => {
        const found = (res.data || []).find((item) => item.id === id);
        if (found) {
          setNews({
            ...found,
            badge: found.badge
              ? typeof found.badge === "string"
                ? JSON.parse(found.badge)
                : found.badge
              : { text: "", color: "gray" },
            imageUrls: Array.isArray(found.imageUrls)
              ? found.imageUrls
              : found.imageUrls
              ? [found.imageUrls]
              : [],
          });
        }
        setLoading(false);
      });
    }
  }, [id, news]);

  const minioPrefix = process.env.VITE_URL_MINIO
    ? process.env.VITE_URL_MINIO.endsWith("/")
      ? process.env.VITE_URL_MINIO
      : process.env.VITE_URL_MINIO + "/"
    : "/";

  // Function to calculate reading time
  const getReadingTime = (content) => {
    if (!content) return 0;
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, "");
    const wordCount = textContent.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#f0f2f5",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!news) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#f0f2f5",
        }}
      >
        <Card style={{ width: 400, textAlign: "center" }}>
          <Title level={4}>Không tìm thấy bài viết</Title>
          <Text type="secondary">
            Bài viết bạn đang tìm kiếm không tồn tại.
          </Text>
          <div style={{ marginTop: 16 }}>
            <Button type="primary" onClick={() => navigate(-1)}>
              <ArrowLeftOutlined /> Quay lại
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>
      {/* Header Navigation - Simplified */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "white",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          padding: "12px 16px",
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            type="text"
          >
            Quay lại
          </Button>
          <Space>
            <Button icon={<BookOutlined />} type="text" />
            <Button icon={<ShareAltOutlined />} type="text" />
          </Space>
        </div>
      </div>

      {/* Main Content - More compact */}
      <div style={{ maxWidth: 800, margin: "16px auto", padding: "0 16px" }}>
        <Card
          style={{
            borderRadius: 8,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
          bodyStyle={{ padding: "24px" }}
        >
          {/* Article Header - More compact */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {news.badge && news.badge.text && (
                <Badge
                  color={news.badge.color}
                  text={news.badge.text}
                  style={{
                    backgroundColor: `${news.badge.color}15`,
                    border: `1px solid ${news.badge.color}30`,
                    borderRadius: 4,
                    padding: "0 8px",
                  }}
                />
              )}
              <Space size={16}>
                {news.date && (
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {formatDate(news.date)}
                  </Text>
                )}
                <Text type="secondary" style={{ fontSize: 14 }}>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  {getReadingTime(news.content)} phút đọc
                </Text>
              </Space>
            </div>

            <Title
              level={2}
              style={{
                fontSize: 28,
                marginTop: 0,
                marginBottom: 24,
              }}
            >
              {news.title}
            </Title>

            <Divider style={{ margin: "0 0 24px 0" }} />
          </div>

          {/* Images - Better layout */}
          {news.imageUrls && news.imageUrls.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              {news.imageUrls.length === 1 ? (
                <div style={{ textAlign: "center" }}>
                  <img
                    src={
                      news.imageUrls[0].startsWith("http")
                        ? news.imageUrls[0]
                        : `${minioPrefix}${
                            news.imageUrls[0].startsWith("/")
                              ? news.imageUrls[0].slice(1)
                              : news.imageUrls[0]
                          }`
                    }
                    alt="Hình ảnh bài viết"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 400,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      news.imageUrls.length === 2
                        ? "1fr 1fr"
                        : "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 8,
                  }}
                >
                  {news.imageUrls.map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        height: 200,
                        borderRadius: 8,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={
                          img.startsWith("http")
                            ? img
                            : `${minioPrefix}${
                                img.startsWith("/") ? img.slice(1) : img
                              }`
                        }
                        alt={`Hình ảnh ${idx + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Article Content */}
          <div
            className="article-content"
            style={{
              fontSize: 16,
              lineHeight: 1.6,
            }}
            dangerouslySetInnerHTML={{ __html: news.content }}
          />

          {/* Article Footer - Simplified */}
          <Divider style={{ margin: "24px 0" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Text type="secondary" style={{ fontSize: 14 }}>
              Cập nhật lần cuối: {formatDate(news.date)}
            </Text>
            <Space>
              <Button size="middle" icon={<BookOutlined />}>
                Lưu bài viết
              </Button>
              <Button size="middle" icon={<ShareAltOutlined />}>
                Chia sẻ
              </Button>
            </Space>
          </div>
        </Card>

        {/* Bottom Navigation - Centered and compact */}
        <div style={{ textAlign: "center", margin: "24px 0" }}>
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            size="large"
            style={{
              borderRadius: 4,
              background: "#6366f1",
              borderColor: "#6366f1",
            }}
          >
            Quay lại danh sách tin tức
          </Button>
        </div>
      </div>

      {/* Custom Styles for article content */}
      <style jsx>{`
        .article-content h1,
        .article-content h2,
        .article-content h3,
        .article-content h4,
        .article-content h5,
        .article-content h6 {
          margin-top: 24px;
          margin-bottom: 16px;
          font-weight: 600;
          line-height: 1.3;
        }

        .article-content h1 {
          font-size: 24px;
        }

        .article-content h2 {
          font-size: 22px;
        }

        .article-content h3 {
          font-size: 20px;
        }

        .article-content p {
          margin-bottom: 16px;
        }

        .article-content img {
          max-width: 100%;
          height: auto;
          margin: 16px 0;
          border-radius: 4px;
        }

        .article-content ul,
        .article-content ol {
          margin-bottom: 16px;
          padding-left: 24px;
        }

        .article-content li {
          margin-bottom: 8px;
        }

        .article-content blockquote {
          border-left: 4px solid #6366f1;
          padding: 8px 16px;
          margin: 16px 0;
          background-color: #f8fafc;
        }

        @media (max-width: 576px) {
          .article-content {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}

export default NewsDetail;
