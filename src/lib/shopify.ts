import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || 'mock-store.myshopify.com';
const storefrontAccessToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || 'mock-token';

async function shopifyFetch({ query, variables = {} }: { query: string; variables?: any }) {
  // If no real credentials, return mock data for demo purposes
  if (!import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || !import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    return getMockData(query, variables);
  }

  const endpoint = `https://${domain}/api/2024-01/graphql.json`;

  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const body = await result.json();
    
    if (body.errors) {
      console.error('Shopify GraphQL Errors:', JSON.stringify(body.errors, null, 2));
      throw new Error(body.errors[0].message);
    }

    return {
      status: result.status,
      body,
    };
  } catch (error) {
    console.error('Error fetching from Shopify:', error);
    throw error;
  }
}

export async function getProducts() {
  // Try to get from Firestore first
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  } catch (e) {
    console.warn('Firestore products fetch failed, falling back to Shopify', e);
  }

  const query = `
    query getProducts {
      products(first: 12) {
        edges {
          node {
            id
            title
            handle
            description
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({ query });
  return response.body?.data?.products?.edges.map((edge: any) => edge.node) || [];
}

export async function getProduct(handle: string) {
  // Try Firestore first
  try {
    const docRef = doc(db, 'products', handle);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
  } catch (e) {
    console.warn('Firestore product fetch failed', e);
  }

  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        images(first: 5) {
          edges {
            node {
              url
              altText
            }
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({ query, variables: { handle } });
  return response.body?.data?.product;
}

export async function searchProducts(searchTerm: string) {
  // Try to search in Firestore first (simple title match)
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    if (!querySnapshot.empty) {
      const allProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return allProducts.filter((p: any) => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  } catch (e) {
    console.warn('Firestore search failed', e);
  }

  const query = `
    query searchProducts($searchTerm: String!) {
      products(first: 10, query: $searchTerm) {
        edges {
          node {
            id
            title
            handle
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({ query, variables: { searchTerm } });
  return response.body?.data?.products?.edges.map((edge: any) => edge.node) || [];
}

export async function getCollections() {
  const query = `
    query getCollections {
      collections(first: 10) {
        edges {
          node {
            id
            title
            handle
            description
            image {
              url
              altText
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({ query });
  return response.body?.data?.collections?.edges.map((edge: any) => edge.node) || [];
}

export async function getProductsByCollection(handle: string) {
  const query = `
    query getProductsByCollection($handle: String!) {
      collection(handle: $handle) {
        products(first: 20) {
          edges {
            node {
              id
              title
              handle
              description
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({ query, variables: { handle } });
  return response.body?.data?.collection?.products?.edges.map((edge: any) => edge.node) || [];
}

export async function createCheckout(lineItems: { variantId: string; quantity: number }[]) {
  // If no real credentials, return a mock checkout URL
  if (!import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || !import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    return { webUrl: 'https://checkout.shopify.com/mock-checkout' };
  }

  const query = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      lines: lineItems.map(item => ({
        merchandiseId: item.variantId,
        quantity: item.quantity
      }))
    }
  };

  const response = await shopifyFetch({ query, variables });
  
  const userErrors = response.body?.data?.cartCreate?.userErrors;
  if (userErrors?.length > 0) {
    throw new Error(userErrors[0].message);
  }

  const cart = response.body?.data?.cartCreate?.cart;
  return { webUrl: cart?.checkoutUrl };
}

// Mock Data for when API keys are missing
function getMockData(query: string, variables: any) {
  if (query.includes('searchProducts')) {
    const allProducts = getMockData('query getProducts', variables).body.data.products.edges;
    const searchTerm = variables.searchTerm?.toLowerCase() || '';
    const filtered = allProducts.filter((edge: any) => 
      edge.node.title.toLowerCase().includes(searchTerm) ||
      edge.node.description.toLowerCase().includes(searchTerm)
    );
    return {
      body: {
        data: {
          products: {
            edges: filtered
          }
        }
      }
    };
  }

  if (query.includes('getCollections')) {
    return {
      body: {
        data: {
          collections: {
            edges: [
              {
                node: {
                  id: 'c1',
                  title: 'New Arrivals',
                  handle: 'new-arrivals',
                  description: 'The latest drops from Lookout Post.',
                  image: { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800', altText: 'New Arrivals' }
                }
              },
              {
                node: {
                  id: 'c2',
                  title: 'Tactical Gear',
                  handle: 'tactical-gear',
                  description: 'Engineered for the field.',
                  image: { url: 'https://images.unsplash.com/photo-1553062407-98eeb94c6a62?auto=format&fit=crop&q=80&w=800', altText: 'Tactical Gear' }
                }
              }
            ]
          }
        }
      }
    };
  }

  if (query.includes('getProductsByCollection')) {
    return getMockData('query getProducts', variables); // Reuse product mock
  }

  if (query.includes('getProducts')) {
    return {
      body: {
        data: {
          products: {
            edges: [
              {
                node: {
                  id: '1',
                  title: 'Lookout Stealth Jacket',
                  handle: 'stealth-jacket',
                  description: 'A high-performance jacket for the modern explorer.',
                  images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800', altText: 'Stealth Jacket' } }] },
                  priceRange: { minVariantPrice: { amount: '129.00', currencyCode: 'USD' } },
                  variants: { edges: [{ node: { id: 'gid://shopify/ProductVariant/1' } }] }
                }
              },
              {
                node: {
                  id: '2',
                  title: 'Post-Modern Backpack',
                  handle: 'modern-backpack',
                  description: 'Minimalist design meets maximum utility.',
                  images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1553062407-98eeb94c6a62?auto=format&fit=crop&q=80&w=800', altText: 'Backpack' } }] },
                  priceRange: { minVariantPrice: { amount: '89.00', currencyCode: 'USD' } },
                  variants: { edges: [{ node: { id: 'gid://shopify/ProductVariant/2' } }] }
                }
              },
              {
                node: {
                  id: '3',
                  title: 'Urban Tech Cap',
                  handle: 'tech-cap',
                  description: 'Breathable, water-resistant, and stylish.',
                  images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800', altText: 'Cap' } }] },
                  priceRange: { minVariantPrice: { amount: '35.00', currencyCode: 'USD' } },
                  variants: { edges: [{ node: { id: 'gid://shopify/ProductVariant/3' } }] }
                }
              },
              {
                node: {
                  id: '4',
                  title: 'Lookout Post Tee',
                  handle: 'lookout-tee',
                  description: 'Premium organic cotton with a modern fit.',
                  images: { edges: [{ node: { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800', altText: 'Tee' } }] },
                  priceRange: { minVariantPrice: { amount: '45.00', currencyCode: 'USD' } },
                  variants: { edges: [{ node: { id: 'gid://shopify/ProductVariant/4' } }] }
                }
              }
            ]
          }
        }
      }
    };
  }
  
  if (query.includes('getProduct')) {
    return {
      body: {
        data: {
          product: {
            id: '1',
            title: 'Lookout Stealth Jacket',
            handle: 'stealth-jacket',
            description: 'The Lookout Stealth Jacket is engineered for those who demand both style and substance. Featuring a water-resistant outer shell and a breathable mesh lining, it is perfect for transitional weather and urban exploration.',
            images: {
              edges: [
                { node: { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800', altText: 'Stealth Jacket' } },
                { node: { url: 'https://images.unsplash.com/photo-1544022613-e87ce7526ed1?auto=format&fit=crop&q=80&w=800', altText: 'Stealth Jacket Detail' } }
              ]
            },
            priceRange: { minVariantPrice: { amount: '129.00', currencyCode: 'USD' } },
            variants: { edges: [{ node: { id: 'v1' } }] }
          }
        }
      }
    };
  }

  return { body: { data: {} } };
}
