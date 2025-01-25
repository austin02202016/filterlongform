import LinkedInOutput from "@/components/LinkedInOutput";

interface OutputSectionProps {
  generatedPosts: string[];
}

const OutputSection = ({ generatedPosts }: OutputSectionProps) => {
  if (generatedPosts.length === 0) return null;

  return (
    <div className="space-y-4 bg-background p-6 rounded-lg shadow-md w-full">
      <h3 className="text-lg font-semibold text-white text-center">Generated LinkedIn Posts:</h3>
      <div className="space-y-4 flex flex-col items-center">
        {generatedPosts.map((post, index) => (
          <div key={index} className="w-full max-w-xl">
            <LinkedInOutput 
              content={post} 
              author="Chris Voss" 
              style="jesse-style" 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutputSection;
