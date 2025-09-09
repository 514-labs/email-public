export const WELCOME_EMAIL_TEMPLATE = {
  subject: "Welcome to Boreal Cloud Waitlist!",
  htmlContent: `
    <p>Welcome to Boreal Cloud! Thanks for joining our waitlist. We're thrilled to have you with us.</p>
    
    <p><strong>Want to skip the queue?</strong> Simply reply to this email and tell us what you're planning to build. We'd love to learn more about your project and can fast-track your access.</p>
    
    <p>While you wait, here are a couple of ways to get involved with our community:</p>
    <ul>
      <li><strong>Join our Slack:</strong> Connect with other developers in the <a href="https://join.slack.com/t/moose-community/shared_invite/zt-2fjh5n3wz-cnOmM9Xe9DYAgQrNu8xKxg">Moose Community</a></li>
      <li><strong>Follow our progress:</strong> Star and follow the <a href="https://github.com/514-labs/moosestack">MooseStack repo</a> to stay updated</li>
    </ul>
        
    <p>Thanks,<br>The FiveOneFour team, builders/maintainers of MooseStack, Sloan AI and Boreal Cloud</p>
  `,
};

// Template rendering function
export function renderTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/{{(\w+)}}/g, (match, key) => {
    return variables[key] || match;
  });
}