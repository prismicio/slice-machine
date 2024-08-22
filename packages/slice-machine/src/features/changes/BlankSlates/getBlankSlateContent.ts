interface BlankSlateContent {
  img: string;
  title: string;
  description: string;
}

export function getBlankSlateContent(
  isPostPush: boolean,
  isExperiment: boolean,
): BlankSlateContent {
  if (isExperiment && isPostPush) return experimentPostPushContent;
  if (isExperiment) return experimentPrePushContent;
  return blankSlateContent;
}

// control variant content
const blankSlateContent = {
  img: "/blank-slate-changes-uptodate.png",
  title: "Everything up-to-date",
  description:
    "You have no changes staged. Your changes appear here after you have saved them, while they're waiting to be pushed to the Page Builder. Ready to get going?",
};

// experiment variants content

const experimentPrePushContent = {
  img: "/blank-slate-push-success.png",
  title: "Everything is up-to-date",
  description:
    "No changes are currently staged. Once you save your updates, they'll appear here and be ready to be pushed to the Page Builder.",
};

const experimentPostPushContent = {
  img: "/blank-slate-push-success.png",
  title: "Success! Your changes have been pushed to Prismic.",
  description: "Add content to your website to bring it to life!",
};
