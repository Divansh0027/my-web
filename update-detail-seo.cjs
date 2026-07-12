const fs = require('fs');
let code = fs.readFileSync('src/features/properties/DetailView.tsx', 'utf8');

code = code.replace(/<Helmet>[\s\S]*?<\/Helmet>/, `      <SEO 
        title={property.title}
        description={\`Buy \${property.title} in \${property.city}. \${property.description?.substring(0, 120)}...\`}
        image={property.images?.[0]}
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateListing",
          "name": property.title,
          "description": property.description,
          "image": property.images?.[0],
          "offers": {
            "@type": "Offer",
            "price": property.price,
            "priceCurrency": "INR"
          }
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://shivsayaproperties.com/"
          },{
            "@type": "ListItem",
            "position": 2,
            "name": "Properties",
            "item": "https://shivsayaproperties.com/properties"
          },{
            "@type": "ListItem",
            "position": 3,
            "name": property.title
          }]
        })}
      </script>`);

fs.writeFileSync('src/features/properties/DetailView.tsx', code);
