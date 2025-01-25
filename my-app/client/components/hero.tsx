const HeroSection = () => {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Your Content Machine
          </h1>
          <p className="text-lg text-muted-foreground">presented by Austin Kennedy</p>
        </div>
        <p className="text-muted-foreground max-w-[600px] mx-auto">
          Upload your content file and optional "write like" file to generate engaging posts. 
          Our AI will process your content and create tailored posts based on your input.
        </p>
      </div>
    );
  };
  
  export default HeroSection;