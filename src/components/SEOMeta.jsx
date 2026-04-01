import React, { useEffect } from 'react';
import { generatePageMeta, addOrganizationSchema } from 'utils/generateSEOMeta';

/**
 * SEO Meta Component
 * Automatically updates meta tags for each page
 */
export function SEOMeta({ title, description, canonical, ogImage, keywords, ogType = 'website', children }) {
  useEffect(() => {
    generatePageMeta({
      title,
      description,
      canonical,
      ogImage,
      keywords,
      ogType
    });
  }, [title, description, canonical, ogImage, keywords, ogType]);

  return <>{children}</>;
}

/**
 * Organization Schema Provider
 * Add organization metadata to the entire site
 */
export function OrganizationSchemaProvider({ children }) {
  useEffect(() => {
    addOrganizationSchema();
  }, []);

  return <>{children}</>;
}

export default SEOMeta;
