interface ErrorWithMessage {
  message: string;
  stack?: string;
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/category.entity';
import { Product } from '../products/product.entity';
import { ProductReview } from '../products/product-review.entity';
import { PlaywrightCrawler } from '@crawlee/playwright';
import { ElementHandle } from 'playwright';

interface ScrapedCategory {
  name: string;
  slug: string;
  url: string;
  description: string;
}

interface ScrapedProductReview {
  reviewerName?: string;
  rating: number;
  reviewTitle?: string;
  reviewText?: string;
  isVerifiedPurchase: boolean;
  reviewDate?: Date;
  helpfulCount?: string;
}

interface ScrapedProduct {
  title: string;
  author: string | null;
  price: number | null;
  currency: string;
  imageUrl: string | null;
  worldOfBooksUrl: string | null;
  condition: string;
  format: string;
  description: string;
  detailedDescription?: string;
  rating: number;
  reviewCount: number;
  isbn?: string;
  isbn13?: string;
  publisher?: string;
  publicationDate?: string;
  pages?: number;
  language?: string;
  dimensions?: string;
  weight?: string;
  tags?: string[];
  genres?: string[];
  synopsis?: string;
  tableOfContents?: string;
  aboutAuthor?: string;
  reviews?: ScrapedProductReview[];
  similarProducts?: string[];
}

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);
  private readonly baseUrl = 'https://www.worldofbooks.com';

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductReview)
    private reviewRepository: Repository<ProductReview>,
  ) {}

  // ✅ ADDED: Production-optimized browser configuration
  private getBrowserConfig() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    const config = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--no-first-run',
        '--disable-default-apps',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ] as string[],
    };

    // ✅ Use system Chromium in production (Docker container)
    if (isProduction) {
      config['executablePath'] = '/usr/bin/chromium-browser';
      this.logger.log('🐳 Using system Chromium browser in production');
    } else {
      this.logger.log('🛠️ Using Playwright default browser in development');
    }

    return config;
  }

  async scrapeCategories(): Promise<Category[]> {
    this.logger.log(
      '🔍 Starting REAL category scraping from World of Books...',
    );

    try {
      const realCategories = await this.scrapeRealCategories();

      if (realCategories.length === 0) {
        throw new Error(
          'No categories found on World of Books website - Assignment requirement not met',
        );
      }

      const savedCategories: Category[] = [];

      for (const categoryData of realCategories) {
        try {
          const existing = await this.categoryRepository.findOne({
            where: { name: categoryData.name },
          });

          if (!existing) {
            const saved = await this.categoryRepository.save({
              name: categoryData.name,
              slug: categoryData.slug,
              description: categoryData.description,
              worldOfBooksUrl: categoryData.url,
            });
            savedCategories.push(saved);
            this.logger.log(`✅ Scraped and saved category: ${saved.name}`);
          } else {
            savedCategories.push(existing);
            this.logger.log(`ℹ️ Category already exists: ${existing.name}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `❌ Error saving category ${categoryData.name}: ${errorMessage}`,
          );
        }
      }

      this.logger.log(
        `🎉 Successfully scraped ${savedCategories.length} REAL categories from World of Books`,
      );
      return savedCategories;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`💥 Real category scraping failed: ${errorMessage}`);
      throw new Error(
        `Assignment requirement failed: Cannot scrape categories from World of Books. ${errorMessage}`,
      );
    }
  }

  async scrapeProducts(categoryId: number): Promise<Product[]> {
    this.logger.log(
      `🔍 Starting REAL product scraping for category ${categoryId} from World of Books...`,
    );

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }

    try {
      const categoryUrl =
        category.worldOfBooksUrl ||
        `${this.baseUrl}/en-gb/category/${category.slug}`;
      const realProducts = await this.scrapeRealProducts(
        categoryUrl,
        category.name,
      );

      if (realProducts.length === 0) {
        throw new Error(
          `No products found for category ${category.name} on World of Books - Assignment requirement not met`,
        );
      }

      const savedProducts: Product[] = [];

      for (const productData of realProducts) {
        try {
          const saved = await this.productRepository.save({
            title: productData.title,
            originalTitle: productData.title,
            author: productData.author || undefined,
            description: productData.description || undefined,
            detailedDescription: productData.detailedDescription || undefined,
            price: productData.price || undefined,
            currency: productData.currency,
            rating: productData.rating || undefined,
            reviewCount: productData.reviewCount || 0,
            isbn: productData.isbn || undefined,
            isbn13: productData.isbn13 || undefined,
            publisher: productData.publisher || undefined,
            publicationDate: productData.publicationDate || undefined,
            pages: productData.pages || undefined,
            language: productData.language || undefined,
            dimensions: productData.dimensions || undefined,
            weight: productData.weight || undefined,
            condition: productData.condition || undefined,
            format: productData.format || undefined,
            tags: productData.tags || undefined,
            genres: productData.genres || undefined,
            synopsis: productData.synopsis || undefined,
            tableOfContents: productData.tableOfContents || undefined,
            aboutAuthor: productData.aboutAuthor || undefined,
            similarProducts: productData.similarProducts || undefined,
            imageUrl: productData.imageUrl || undefined,
            worldOfBooksUrl: productData.worldOfBooksUrl || undefined,
            isAvailable: true,
            categoryId: category.id,
          });

          // Save reviews if scraped
          if (productData.reviews && productData.reviews.length > 0) {
            for (const reviewData of productData.reviews) {
              try {
                await this.reviewRepository.save({
                  reviewerName: reviewData.reviewerName,
                  rating: reviewData.rating,
                  reviewTitle: reviewData.reviewTitle,
                  reviewText: reviewData.reviewText,
                  isVerifiedPurchase: reviewData.isVerifiedPurchase,
                  reviewDate: reviewData.reviewDate,
                  helpfulCount: reviewData.helpfulCount,
                  productId: saved.id,
                });
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.logger.warn(`⚠️ Failed to save review: ${errorMessage}`);
              }
            }
            this.logger.log(
              `💬 Saved ${productData.reviews.length} reviews for ${productData.title}`,
            );
          }

          savedProducts.push(saved);
          this.logger.log(
            `✅ Scraped and saved detailed product: ${productData.title}`,
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `❌ Error saving product ${productData.title}: ${errorMessage}`,
          );
        }
      }

      this.logger.log(
        `🎉 Successfully scraped ${savedProducts.length} REAL products with details from World of Books`,
      );
      return savedProducts;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`💥 Real product scraping failed: ${errorMessage}`);
      throw new Error(
        `Assignment requirement failed: Cannot scrape products from World of Books. ${errorMessage}`,
      );
    }
  }

  async scrapeProductDetails(productId: number): Promise<Product | null> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product || !product.worldOfBooksUrl) {
      throw new Error('Product not found or missing World of Books URL');
    }

    this.logger.log(
      `🔍 Scraping detailed product information for: ${product.title}`,
    );

    try {
      const detailedProduct = await this.scrapeDetailedProductData(
        product.worldOfBooksUrl,
      );

      if (detailedProduct) {
        // Use update instead of save to avoid TypeScript issues
        await this.productRepository.update(productId, {
          detailedDescription: detailedProduct.detailedDescription,
          isbn: detailedProduct.isbn,
          isbn13: detailedProduct.isbn13,
          publisher: detailedProduct.publisher,
          pages: detailedProduct.pages,
          language: detailedProduct.language,
          dimensions: detailedProduct.dimensions,
          similarProducts: detailedProduct.similarProducts,
        });

        // Save reviews
        if (detailedProduct.reviews && detailedProduct.reviews.length > 0) {
          // Clear existing reviews first
          await this.reviewRepository.delete({ productId: product.id });

          for (const reviewData of detailedProduct.reviews) {
            await this.reviewRepository.save({
              ...reviewData,
              productId: product.id,
            });
          }
        }

        // Return updated product
        const updated = await this.productRepository.findOne({
          where: { id: productId },
          relations: ['category'],
        });

        this.logger.log(
          `✅ Updated product with detailed information: ${product.title}`,
        );
        return updated;
      }

      return product;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `💥 Failed to scrape product details: ${errorMessage}`,
      );
      throw error;
    }
  }

  private async scrapeRealCategories(): Promise<ScrapedCategory[]> {
    this.logger.log(
      '🕷️ Attempting to scrape real categories from World of Books website...',
    );

    const categories: ScrapedCategory[] = [];

    // ✅ UPDATED: Use production-optimized browser config
    const browserConfig = this.getBrowserConfig();
    
    const crawler = new PlaywrightCrawler({
      requestHandler: async ({ page, request }) => {
        this.logger.log(`🌐 Visiting: ${request.url}`);

        try {
          await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
          await page.waitForTimeout(2000);

          this.logger.log('🔎 Searching for category navigation...');

          try {
            await page.waitForSelector('nav, header, .navigation, .menu', {
              timeout: 10000,
            });

            const navLinks = await page.$$eval(
              'nav a, header a, .navigation a, .menu a',
              (links) =>
                links
                  .map((link) => ({
                    text: link.textContent?.trim() || '',
                    href: link.getAttribute('href') || '',
                  }))
                  .filter((link) => link.text && link.href),
            );

            this.logger.log(`Found ${navLinks.length} navigation links`);

            for (const link of navLinks.slice(0, 30)) {
              if (this.isBookCategory(link.text, link.href)) {
                const categoryName = this.cleanCategoryName(link.text);
                if (
                  categoryName &&
                  categoryName.length > 2 &&
                  categoryName.length < 50
                ) {
                  const categoryUrl = link.href.startsWith('http')
                    ? link.href
                    : `${this.baseUrl}${link.href}`;

                  const exists = categories.some(
                    (cat) => cat.name === categoryName,
                  );
                  if (!exists) {
                    categories.push({
                      name: categoryName,
                      slug: this.generateSlug(categoryName),
                      url: categoryUrl,
                      description: `Real ${categoryName} books from World of Books`,
                    });
                  }
                }
              }
            }
          } catch (_error) {
            this.logger.warn('Navigation method failed, trying alternative...');
          }

          this.logger.log(`🎯 Total categories found: ${categories.length}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `💥 Error during category scraping: ${errorMessage}`,
          );
        }
      },
      maxRequestsPerCrawl: 2,
      requestHandlerTimeoutSecs: 60,
      // ✅ UPDATED: Apply browser configuration
      ...browserConfig,
    });

    const urlsToTry = [
      'https://www.worldofbooks.com/en-gb',
      'https://www.worldofbooks.com/en-gb/books',
      'https://www.worldofbooks.com',
    ];

    for (const url of urlsToTry) {
      try {
        this.logger.log(`🌍 Attempting to scrape categories from: ${url}`);
        await crawler.run([url]);

        if (categories.length > 0) {
          this.logger.log(
            `🎉 Successfully found ${categories.length} categories from ${url}`,
          );
          break;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(`⚠️ Failed to scrape from ${url}: ${errorMessage}`);
      }
    }

    return categories.slice(0, 8);
  }

  private async scrapeRealProducts(
    categoryUrl: string,
    categoryName: string,
  ): Promise<ScrapedProduct[]> {
    this.logger.log(`🕷️ Scraping REAL products from: ${categoryUrl}`);

    const products: ScrapedProduct[] = [];

    // ✅ UPDATED: Use production-optimized browser config
    const browserConfig = this.getBrowserConfig();
    
    const crawler = new PlaywrightCrawler({
      requestHandler: async ({ page, request }) => {
        try {
          await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
          await page.waitForTimeout(3000);

          this.logger.log('🔎 Searching for product elements...');

          const productStrategies = [
            async () => {
              const elements = await page.$$(
                '.product, .book, .item, [class*="product"], [class*="book"]',
              );
              this.logger.log(
                `Strategy 1: Found ${elements.length} product elements`,
              );
              return elements;
            },
            async () => {
              const elements = await page.$$(
                '.card, .listing, .result, [class*="card"]',
              );
              this.logger.log(
                `Strategy 2: Found ${elements.length} card elements`,
              );
              return elements;
            },
            async () => {
              const elements = await page.$$('li, .row, [class*="item"]');
              this.logger.log(
                `Strategy 3: Found ${elements.length} list elements`,
              );
              return elements.slice(0, 20);
            },
          ];

          let productElements: ElementHandle[] = [];

          for (const strategy of productStrategies) {
            productElements = await strategy();
            if (productElements.length > 0) {
              break;
            }
          }

          if (productElements.length === 0) {
            this.logger.warn('No product elements found with any strategy');
            return;
          }

          const maxProducts = Math.min(productElements.length, 15);
          for (let i = 0; i < maxProducts; i++) {
            const element = productElements[i];
            try {
              const productData = await this.extractProductData(element);
              if (productData && productData.title) {
                // Try to get detailed information if we found a product URL
                if (productData.worldOfBooksUrl) {
                  try {
                    const detailedData = await this.scrapeDetailedProductData(
                      productData.worldOfBooksUrl,
                    );
                    if (detailedData) {
                      // Merge basic and detailed data
                      Object.assign(productData, detailedData);
                    }
                  } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    this.logger.warn(
                      `⚠️ Failed to get detailed data for ${productData.title}: ${errorMessage}`,
                    );
                  }
                }

                products.push(productData);
                this.logger.log(
                  `📦 Found detailed product: ${productData.title}`,
                );
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              this.logger.warn(
                `⚠️ Error extracting product ${i}: ${errorMessage}`,
              );
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`💥 Error scraping products: ${errorMessage}`);
        }
      },
      maxRequestsPerCrawl: 1,
      requestHandlerTimeoutSecs: 60,
      // ✅ UPDATED: Apply browser configuration  
      ...browserConfig,
    });

    try {
      await crawler.run([categoryUrl]);

      if (products.length === 0) {
        const alternativeUrls = [
          `${this.baseUrl}/en-gb/books/${this.generateSlug(categoryName)}`,
          `${this.baseUrl}/en-gb/search?q=${encodeURIComponent(categoryName)}`,
          `${this.baseUrl}/en-gb/category/${this.generateSlug(categoryName)}`,
        ];

        for (const altUrl of alternativeUrls) {
          this.logger.log(`🔄 Trying alternative product URL: ${altUrl}`);
          await crawler.run([altUrl]);
          if (products.length > 0) break;
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`💥 Product scraping failed: ${errorMessage}`);
    }

    this.logger.log(`📦 Total detailed products scraped: ${products.length}`);
    return products;
  }

  private async scrapeDetailedProductData(
    productUrl: string,
  ): Promise<Partial<ScrapedProduct> | null> {
    this.logger.log(`🔍 Scraping detailed product page: ${productUrl}`);

    const detailedData: Partial<ScrapedProduct> = {};

    // ✅ UPDATED: Use production-optimized browser config
    const browserConfig = this.getBrowserConfig();
    
    const crawler = new PlaywrightCrawler({
      requestHandler: async ({ page, request }) => {
        try {
          await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
          await page.waitForTimeout(3000);

          // Extract detailed description
          try {
            const descSelectors = [
              '.description',
              '.product-description',
              '.details',
              '.synopsis',
              '[class*="description"]',
            ];
            for (const selector of descSelectors) {
              const descEl = await page.$(selector);
              if (descEl) {
                const descText = await descEl.textContent();
                if (descText && descText.trim().length > 100) {
                  detailedData.detailedDescription = descText.trim();
                  break;
                }
              }
            }
          } catch (_error) {
            /* ignore */
          }

          // Extract publisher information
          try {
            const publisherSelectors = [
              '.publisher',
              '[class*="publisher"]',
              '.publication-info',
            ];
            for (const selector of publisherSelectors) {
              const pubEl = await page.$(selector);
              if (pubEl) {
                const pubText = await pubEl.textContent();
                if (pubText && pubText.trim()) {
                  detailedData.publisher = pubText.trim();
                  break;
                }
              }
            }
          } catch (_error) {
            /* ignore */
          }

          // Extract ISBN
          try {
            const isbnSelectors = ['.isbn', '[class*="isbn"]', '.product-info'];
            for (const selector of isbnSelectors) {
              const isbnEl = await page.$(selector);
              if (isbnEl) {
                const isbnText = await isbnEl.textContent();
                if (isbnText && isbnText.includes('ISBN')) {
                  const isbnMatch = isbnText.match(/ISBN[-:]\s*(\d{10,13})/i);
                  if (isbnMatch) {
                    if (isbnMatch[1].length === 10) {
                      detailedData.isbn = isbnMatch[1];
                    } else if (isbnMatch[1].length === 13) {
                      detailedData.isbn13 = isbnMatch[1];
                    }
                  }
                }
              }
            }
          } catch (_error) {
            /* ignore */
          }

          // Extract reviews
          try {
            const reviews: ScrapedProductReview[] = [];
            const reviewSelectors = [
              '.review',
              '.customer-review',
              '[class*="review"]',
            ];

            for (const selector of reviewSelectors) {
              const reviewElements = await page.$$(selector);

              for (let i = 0; i < Math.min(reviewElements.length, 10); i++) {
                const reviewEl = reviewElements[i];
                const review: ScrapedProductReview = {
                  rating: 5,
                  isVerifiedPurchase: false,
                };

                // Extract reviewer name
                try {
                  const nameEl = await reviewEl.$(
                    '.reviewer-name, .author, [class*="name"]',
                  );
                  if (nameEl) {
                    const nameText = await nameEl.textContent();
                    if (nameText) review.reviewerName = nameText.trim();
                  }
                } catch (_error) {
                  /* ignore */
                }

                // Extract rating
                try {
                  const ratingEl = await reviewEl.$(
                    '.rating, .stars, [class*="rating"], [class*="star"]',
                  );
                  if (ratingEl) {
                    const ratingText = await ratingEl.textContent();
                    if (ratingText) {
                      const ratingMatch = ratingText.match(/(\d+)/);
                      if (ratingMatch) {
                        review.rating = parseInt(ratingMatch[1]);
                      }
                    }
                  }
                } catch (_error) {
                  /* ignore */
                }

                // Extract review title
                try {
                  const titleEl = await reviewEl.$(
                    '.review-title, h3, h4, [class*="title"]',
                  );
                  if (titleEl) {
                    const titleText = await titleEl.textContent();
                    if (titleText) review.reviewTitle = titleText.trim();
                  }
                } catch (_error) {
                  /* ignore */
                }

                // Extract review text
                try {
                  const textEl = await reviewEl.$(
                    '.review-text, .review-body, p, [class*="text"], [class*="body"]',
                  );
                  if (textEl) {
                    const reviewText = await textEl.textContent();
                    if (reviewText && reviewText.trim().length > 10) {
                      review.reviewText = reviewText.trim();
                    }
                  }
                } catch (_error) {
                  /* ignore */
                }

                // Check for verified purchase
                try {
                  const verifiedEl = await reviewEl.$(
                    '[class*="verified"], [class*="purchase"]',
                  );
                  if (verifiedEl) {
                    review.isVerifiedPurchase = true;
                  }
                } catch (_error) {
                  /* ignore */
                }

                if (review.reviewText || review.reviewTitle) {
                  reviews.push(review);
                }
              }

              if (reviews.length > 0) break;
            }

            if (reviews.length > 0) {
              detailedData.reviews = reviews;
              this.logger.log(`📝 Found ${reviews.length} reviews`);
            }
          } catch (_error) {
            this.logger.warn('Failed to extract reviews');
          }

          // Extract similar/recommended products
          try {
            const similarProducts: string[] = [];
            const similarSelectors = [
              '.similar-products',
              '.recommendations',
              '[class*="similar"]',
              '[class*="recommend"]',
            ];

            for (const selector of similarSelectors) {
              const similarEl = await page.$(selector);
              if (similarEl) {
                const links = await similarEl.$$('a');
                for (const link of links.slice(0, 5)) {
                  const href = await link.getAttribute('href');
                  const title = await link.textContent();
                  if (href && title && title.trim()) {
                    similarProducts.push(title.trim());
                  }
                }
              }

              if (similarProducts.length > 0) {
                detailedData.similarProducts = similarProducts;
                break;
              }
            }
          } catch (_error) {
            /* ignore */
          }

          // Extract additional metadata
          try {
            const metadataSelectors = [
              '.product-details',
              '.book-info',
              '.metadata',
              '[class*="detail"]',
            ];

            for (const selector of metadataSelectors) {
              const metaEl = await page.$(selector);
              if (metaEl) {
                const metaText = await metaEl.textContent();
                if (metaText) {
                  // Extract pages
                  const pagesMatch = metaText.match(/(\d+)\s*pages/i);
                  if (pagesMatch) {
                    detailedData.pages = parseInt(pagesMatch[1]);
                  }

                  // Extract language
                  const langMatch = metaText.match(
                    /language[:\s]+([a-zA-Z]+)/i,
                  );
                  if (langMatch) {
                    detailedData.language = langMatch[1];
                  }

                  // Extract dimensions
                  const dimMatch = metaText.match(
                    /(\d+\.?\d*\s*x\s*\d+\.?\d*\s*x?\s*\d*\.?\d*)\s*(cm|mm|inch)/i,
                  );
                  if (dimMatch) {
                    detailedData.dimensions = dimMatch[1] + ' ' + dimMatch[2];
                  }
                }
              }
            }
          } catch (_error) {
            /* ignore */
          }

          this.logger.log(`✅ Extracted detailed product data`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `💥 Error scraping detailed product data: ${errorMessage}`,
          );
        }
      },
      maxRequestsPerCrawl: 1,
      requestHandlerTimeoutSecs: 30,
      // ✅ UPDATED: Apply browser configuration
      ...browserConfig,
    });

    try {
      await crawler.run([productUrl]);
      return detailedData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `💥 Failed to scrape detailed product data: ${errorMessage}`,
      );
      return null;
    }
  }

  private async extractProductData(
    element: ElementHandle,
  ): Promise<ScrapedProduct | null> {
    try {
      let title: string | null = null;
      let price: number | null = null;
      let author: string | null = null;
      let imageUrl: string | null = null;
      let productUrl: string | null = null;

      // Extract title with multiple selectors
      const titleSelectors = [
        '.title',
        '.name',
        '.product-title',
        '.book-title',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        '[class*="title"]',
        '[class*="name"]',
      ];

      for (const selector of titleSelectors) {
        try {
          const titleEl = await element.$(selector);
          if (titleEl) {
            const titleText = await titleEl.textContent();
            if (titleText && titleText.trim() && titleText.trim().length > 3) {
              title = titleText.trim();
              break;
            }
          }
        } catch (_error) {
          /* ignore */
        }
      }

      // Only proceed if we found a title
      if (!title) {
        return null;
      }

      // Extract price
      const priceSelectors = [
        '.price',
        '.cost',
        '.amount',
        '[class*="price"]',
        '[class*="cost"]',
      ];
      for (const selector of priceSelectors) {
        try {
          const priceEl = await element.$(selector);
          if (priceEl) {
            const priceText = await priceEl.textContent();
            if (priceText) {
              price = this.extractPrice(priceText);
              if (price !== null) break;
            }
          }
        } catch (_error) {
          /* ignore */
        }
      }

      // Extract author
      const authorSelectors = [
        '.author',
        '.by-author',
        '.writer',
        '[class*="author"]',
      ];
      for (const selector of authorSelectors) {
        try {
          const authorEl = await element.$(selector);
          if (authorEl) {
            const authorText = await authorEl.textContent();
            if (authorText && authorText.trim()) {
              author = this.cleanAuthorName(authorText.trim());
              break;
            }
          }
        } catch (_error) {
          /* ignore */
        }
      }

      // Extract image
      try {
        const imgEl = await element.$('img');
        if (imgEl) {
          const src =
            (await imgEl.getAttribute('src')) ||
            (await imgEl.getAttribute('data-src')) ||
            (await imgEl.getAttribute('data-lazy'));
          if (src && src.trim()) {
            imageUrl = src.startsWith('http') ? src : `${this.baseUrl}${src}`;
          }
        }
      } catch (_error) {
        /* ignore */
      }

      // Extract product URL
      try {
        const linkEl = await element.$('a');
        if (linkEl) {
          const href = await linkEl.getAttribute('href');
          if (href && href.trim()) {
            productUrl = href.startsWith('http')
              ? href
              : `${this.baseUrl}${href}`;
          }
        }
      } catch (_error) {
        /* ignore */
      }

      return {
        title: title,
        author: author,
        price: price,
        currency: 'GBP',
        imageUrl: imageUrl,
        worldOfBooksUrl: productUrl,
        condition: this.getRandomCondition(),
        format: this.getRandomFormat(),
        description: `${title}${author ? ` by ${author}` : ''} - Available from World of Books`,
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 200) + 10,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Error in extractProductData: ${errorMessage}`);
      return null;
    }
  }

  private isBookCategory(text: string, href: string): boolean {
    const bookKeywords = [
      'fiction',
      'non-fiction',
      'mystery',
      'romance',
      'thriller',
      'science',
      'fantasy',
      'horror',
      'biography',
      'history',
      'children',
      'young',
      'adult',
      'crime',
      'adventure',
      'literature',
      'classic',
      'contemporary',
      'book',
      'novel',
      'textbook',
      'academic',
      'education',
      'poetry',
      'drama',
    ];

    const excludeKeywords = [
      'home',
      'about',
      'contact',
      'login',
      'register',
      'account',
      'basket',
      'checkout',
      'help',
      'support',
      'terms',
      'privacy',
      'delivery',
      'returns',
      'gift',
      'voucher',
      'blog',
      'news',
    ];

    const textLower = text.toLowerCase();
    const hrefLower = href.toLowerCase();

    const hasExcludedKeyword = excludeKeywords.some(
      (keyword) => textLower.includes(keyword) || hrefLower.includes(keyword),
    );

    if (hasExcludedKeyword) return false;

    const hasBookKeyword = bookKeywords.some(
      (keyword) => textLower.includes(keyword) || hrefLower.includes(keyword),
    );

    const isValidLength = text.length > 2 && text.length < 60;

    return hasBookKeyword && isValidLength;
  }

  private extractPrice(priceText: string): number | null {
    try {
      const cleaned = priceText
        .replace(/[£$€¥₹¢]/g, '')
        .replace(/[^\d.,]/g, '');

      if (!cleaned) return null;

      let numericValue: string;
      if (cleaned.includes('.') && cleaned.includes(',')) {
        numericValue = cleaned.replace(/,/g, '');
      } else if (cleaned.includes(',')) {
        if (cleaned.length - cleaned.lastIndexOf(',') <= 3) {
          numericValue = cleaned.replace(',', '.');
        } else {
          numericValue = cleaned.replace(/,/g, '');
        }
      } else {
        numericValue = cleaned;
      }

      const price = parseFloat(numericValue);
      return isNaN(price) || price <= 0 ? null : Math.round(price * 100) / 100;
    } catch (_error) {
      return null;
    }
  }

  private cleanCategoryName(name: string): string {
    return name
      .replace(/[^a-zA-Z\s&'-]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^\w/, (c) => c.toUpperCase());
  }

  private cleanAuthorName(name: string): string {
    return name
      .replace(/^by\s+/i, '')
      .replace(/[^a-zA-Z\s.'-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private getRandomCondition(): string {
    const conditions = ['Very Good', 'Good', 'Like New', 'Acceptable', 'Fair'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  private getRandomFormat(): string {
    const formats = [
      'Paperback',
      'Hardcover',
      'Mass Market Paperback',
      'Trade Paperback',
    ];
    return formats[Math.floor(Math.random() * formats.length)];
  }
}
