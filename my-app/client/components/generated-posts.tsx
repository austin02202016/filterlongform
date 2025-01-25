import { Card, CardContent } from "@/components/ui/card"

interface GeneratedPostsProps {
  posts: string[]
}

export function GeneratedPosts({ posts }: GeneratedPostsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Generated Posts</h3>
      <div className="space-y-2">
        {posts.map((post, index) => (
          <Card key={index} className="bg-card/50">
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground">{post}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

