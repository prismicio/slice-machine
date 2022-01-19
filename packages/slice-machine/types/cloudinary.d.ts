interface CloudinaryContextProps {
  cloudName: string;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
interface ImageProps extends JSX.IntrinsicElements.img {
  publicId: string;
  crop: string;
}

interface VideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  publicId: string;
}

interface TransformationProps {
  quality: string;
}

declare module "cloudinary-react" {
  class CloudinaryComponent {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    constructor(props, context) {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function
    getChildContext() {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function
    render() {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    getChildTransformations(children) {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function
    getTransformations() {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    normalizeOptions(...options) {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    getURL(extendedProps) {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    typesFrom(configParams) {}
  }

  export const CloudinaryContext: React.FC<CloudinaryContextProps>;

  export const Image: React.FC<PropsWithChildren<ImageProps>>;

  export const Video: React.FC<PropsWithChildren<VideoProps>>;

  export const Transformation: React.FC<TransformationProps>;
}
