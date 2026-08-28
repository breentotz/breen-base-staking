export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    const body =
      await request.json();

    const {
      postId,
      expectedUsername,
      expectedMessage,
    } = body;

    if (
      !postId ||
      !expectedUsername ||
      !expectedMessage
    ) {
      return Response.json(
        {
          verified: false,
          reason: "missing_fields",
        },
        {
          status: 400,
        }
      );
    }

    if (!env.X_BEARER_TOKEN) {
      return Response.json(
        {
          verified: false,
          reason: "x_api_not_configured",
        },
        {
          status: 500,
        }
      );
    }

    const response =
      await fetch(
        `https://api.x.com/2/tweets/${postId}?expansions=author_id&tweet.fields=text&user.fields=username`,
        {
          headers: {
            Authorization:
              `Bearer ${env.X_BEARER_TOKEN}`,

            Accept:
              "application/json",
          },
        }
      );

    if (!response.ok) {
      return Response.json(
        {
          verified: false,
          reason: "x_api_error",
          status: response.status,
        },
        {
          status: 502,
        }
      );
    }

    const data =
      await response.json();

    const post =
      data.data;

    const author =
      data.includes?.users?.[0];

    if (!post || !author) {
      return Response.json({
        verified: false,
        reason: "x_post_not_found",
      });
    }

    const normalizedExpectedUsername =
      String(expectedUsername)
        .trim()
        .replace(/^@/, "")
        .toLowerCase();

    const normalizedAuthor =
      String(author.username || "")
        .trim()
        .toLowerCase();

    if (
      normalizedAuthor !==
      normalizedExpectedUsername
    ) {
      return Response.json({
        verified: false,
        reason: "x_author_mismatch",
        author:
          normalizedAuthor,
      });
    }

    const contentMatched =
      String(post.text || "")
        .includes(
          expectedMessage
        );

    if (!contentMatched) {
      return Response.json({
        verified: false,
        reason:
          "x_verification_message_not_found",
      });
    }

    return Response.json({
      verified: true,
      reason: "x_identity_verified",
      author:
        normalizedAuthor,
      postId:
        String(post.id),
    });
  } catch (error) {
    console.error(
      "X verification error:",
      error
    );

    return Response.json(
      {
        verified: false,
        reason: "x_verification_failed",
      },
      {
        status: 500,
      }
    );
  }
}