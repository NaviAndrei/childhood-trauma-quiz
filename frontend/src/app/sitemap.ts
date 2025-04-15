import { MetadataRoute } from 'next'
 
// Replace with your actual production domain
const BASE_URL = 'https://www.ihatethisquiz.com';

// Define the possible values for changeFrequency explicitly for typing
type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export default function sitemap(): MetadataRoute.Sitemap {
  
  // Basic sitemap with just the homepage
  const staticRoutes = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency, // Cast to the specific type
      priority: 1,
    },
  ];

  // TODO: Fetch dynamic quiz slugs and add them to the sitemap
  // Example structure (needs actual data fetching):
  // const quizSlugs = await fetchQuizSlugs(); // Assume this fetches [{ slug: 'quiz-1' }, { slug: 'quiz-2' }]
  // const dynamicRoutes = quizSlugs.map((quiz) => ({
  //   url: `${BASE_URL}/quiz/${quiz.slug}`,
  //   lastModified: new Date(), // Or fetch last modified date if available
  //   changeFrequency: 'yearly' as ChangeFrequency, // Cast to the specific type
  //   priority: 0.8,
  // }));

  // Combine static and dynamic routes (when dynamic routes are implemented)
  // return [...staticRoutes, ...dynamicRoutes];

  return staticRoutes;
} 